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

        return Retry.execute(async () => {

            const response = await request(url, {

                method,

                headers: {

                    accept: "application/json",

                    "content-type": "application/json",

                    ...headers

                },

                body: body ? JSON.stringify(body) : undefined,

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

                    retryable: Retry.isRetryable({

                        status: response.statusCode

                    }),

                    raw: result

                });

            }

            return result;

        }, {

            retries: this.retries,

            delay: this.retryDelay

        });

    }

    async stream(url, {

        headers = {},

        body

    } = {}) {

        const response = await request(url, {

            method: "POST",

            headers: {

                accept: "text/event-stream",

                "content-type": "application/json",

                ...headers

            },

            body: JSON.stringify(body),

            headersTimeout: this.timeout,

            bodyTimeout: this.timeout

        });

        if (response.statusCode >= 400) {

            const result = await this.parseResponse(response);

            throw new AIError({

                message: this.extractError(
                    result,
                    response.statusCode
                ),

                status: response.statusCode,

                retryable: Retry.isRetryable({

                    status: response.statusCode

                }),

                raw: result

            });

        }

        return response.body;

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

        return (

            result?.error?.message ??

            result?.message ??

            result?.text ??

            result?.detail ??

            result?.error ??

            `HTTP ${status}`

        );

    }

}