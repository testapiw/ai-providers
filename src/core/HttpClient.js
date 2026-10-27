import { request } from "undici";

import Retry from "./Retry.js";
import AIError from "../errors/AIError.js";

export default class HttpClient {

    constructor({
        timeout = 60000,
        retries = 3,
        retryDelay = 1000
    } = {}) {

        this.timeout = timeout;
        this.retries = retries;
        this.retryDelay = retryDelay;

    }

    async get(url, options = {}) {

        return this.request("GET", url, options);

    }

    async post(url, options = {}) {

        return this.request("POST", url, options);

    }

    async request(method, url, {

        headers = {},

        body = null

    } = {}) {

        try {

            return await Retry.execute(async () => {

                const response = await request(url, {

                    method,

                    headers: {

                        accept: "application/json",

                        "content-type": "application/json",

                        ...headers

                    },

                    body:

                        method === "GET"

                            ? undefined

                            : body
                                ? JSON.stringify(body)
                                : undefined,

                    headersTimeout: this.timeout,

                    bodyTimeout: this.timeout

                });

                const result = await this.parseResponse(response);

                if (response.statusCode >= 400) {

                    throw new AIError({

                        message: this.extractError(
                            result,
                            response.statusCode
                        ),

                        status: response.statusCode,

                        code:
                            result?.error?.type ??
                            result?.error?.status ??
                            result?.error?.code ??
                            "",

                        retryable: Retry.isRetryable({

                            status: response.statusCode

                        }),

                        retryAfter: this.extractRetryAfter(
                            response.headers
                        ),

                        requestId: this.extractRequestId(
                            response.headers,
                            result
                        ),

                        raw: result

                    });

                }

                return {

                    status: response.statusCode,

                    headers: response.headers,

                    body: result

                };

            }, {

                retries: this.retries,

                delay: this.retryDelay

            });

        }

        catch (error) {

            if (error instanceof AIError) {

                throw error;

            }

            // мережеві помилки undici (ECONNRESET, UND_ERR_CONNECT_TIMEOUT тощо)
            // без цього вони не потрапляють у Retry і не мають provider/status
            throw new AIError({

                message: error.message,

                status: 0,

                code:
                    error.code ??
                    error.cause?.code ??
                    "",

                retryable: Retry.isRetryable(error),

                raw: error

            });

        }

    }

    async parseResponse(response) {

        const type = response.headers["content-type"] || "";

        try {

            if (type.includes("application/json")) {

                return await response.body.json();

            }

            return {

                text: await response.body.text()

            };

        }

        catch (error) {

            return {

                parseError: error.message

            };

        }

    }

    extractError(result, status) {

        // || замість ?? : порожній body дає "", і тоді губиться HTTP-код
        return (

            result?.error?.message ||

            result?.message ||

            result?.text ||

            result?.detail ||

            result?.error?.code ||

            result?.error ||

            `HTTP ${status}`

        );

    }

    // Retry-After буває у секундах або у вигляді HTTP-дати
    extractRetryAfter(headers = {}) {

        const value = headers["retry-after"];

        if (!value) {

            return 0;

        }

        const seconds = Number(value);

        if (Number.isFinite(seconds)) {

            return Math.max(0, Math.round(seconds * 1000));

        }

        const date = Date.parse(value);

        return Number.isNaN(date)
            ? 0
            : Math.max(0, date - Date.now());

    }

    extractRequestId(headers = {}, result = null) {

        return (

            headers["x-request-id"] ||

            headers["request-id"] ||

            headers["anthropic-request-id"] ||

            result?.request_id ||

            ""

        );

    }
}
