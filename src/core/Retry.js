import sleep from "../utils/sleep.js";

const RETRY_CODES = [
    408,
    429,
    500,
    502,
    503,
    504,
    529
];

const RETRY_ERRORS = [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "EPIPE",
    "EAI_AGAIN",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_BODY_TIMEOUT",
    "UND_ERR_SOCKET"
];

export default class Retry {

    // стеля очікування: навіть якщо сервер просить довше, не блокуємо надовго
    static MAX_DELAY = 30000;

    static isRetryable(error) {

        if (!error)
            return false;

        if (RETRY_CODES.includes(error.status))
            return true;

        if (RETRY_ERRORS.includes(error.code))
            return true;

        return false;
    }

    static async execute(fn, options = {}) {

        const retries = options.retries ?? 3;

        const delay = options.delay ?? 1000;

        let attempt = 0;

        while (true) {

            try {

                return await fn(attempt);

            }

            catch (error) {

                attempt++;

                if (
                    attempt > retries ||
                    !Retry.isRetryable(error)
                ) {
                    throw error;
                }

                // сервер може попросити конкретну паузу (429 + Retry-After)
                const requested = error.retryAfter ?? 0;

                const wait = Math.min(

                    Math.max(delay * Math.pow(2, attempt - 1), requested),

                    Retry.MAX_DELAY

                );

                await sleep(wait);

            }

        }

    }

}
