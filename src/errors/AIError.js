export default class AIError extends Error {

    constructor({
        message,
        status = 0,
        provider = "",
        retryable = false,
        requestId = "",
        raw = null
    }) {

        super(message);

        this.name = "AIError";

        this.status = status;
        this.provider = provider;
        this.retryable = retryable;
        this.requestId = requestId;
        this.raw = raw;

        Error.captureStackTrace?.(this, AIError);
    }

}