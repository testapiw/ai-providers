import sleep from "../utils/sleep.js";

const RETRY_CODES = [
    429,
    500,
    502,
    503,
    504
];

const RETRY_ERRORS = [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT"
];

export default class Retry {

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

                const wait = delay * Math.pow(2, attempt - 1);

                await sleep(wait);

            }

        }

    }

}