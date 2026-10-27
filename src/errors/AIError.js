export default class AIError extends Error {

    constructor({
        message,
        status = 0,
        code = "",
        provider = "",
        model = "",
        duration = 0,
        retryable = false,
        retryAfter = 0,
        requestId = "",
        raw = null
    }) {

        super(message);

        this.name = "AIError";

        this.status = status;
        this.code = code;
        this.provider = provider;
        this.model = model;
        this.duration = duration;
        this.retryable = retryable;
        // скільки мс просив зачекати сервер (заголовок Retry-After)
        this.retryAfter = retryAfter;
        this.requestId = requestId;
        this.raw = raw;

        Error.captureStackTrace?.(this, AIError);
    }

}