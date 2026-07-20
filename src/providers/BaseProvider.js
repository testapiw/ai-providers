import HttpClient from "../core/HttpClient.js";

export default class BaseProvider {

    constructor(model, http) {

        this.model = model;

        this.http = new HttpClient(http);

    }

    get apiKey() {
        throw new Error("apiKey not implemented");
    }

    get baseUrl() {
        throw new Error("baseUrl not implemented");
    }

    buildUrl() {
        throw new Error("buildUrl() not implemented");
    }

    buildHeaders() {
        return {};
    }

    buildBody() {
        throw new Error("buildBody() not implemented");
    }

    parseResponse() {
        throw new Error("parseResponse() not implemented");
    }

    async generate(request) {

        const response = await this.http.post(

            this.buildUrl(request),

            {

                headers: this.buildHeaders(request),

                body: this.buildBody(request)

            }

        );

        return this.parseResponse(response);

    }

    result({

        status = "",

        text = "",

        usage = {},

        finishReason = null,

        retries = 0,

        metadata = {},

        raw = null

    }) {

        return {
            
            status,

            text,

            usage: {

                promptTokens:

                    usage.promptTokens ?? 0,

                completionTokens:

                    usage.completionTokens ?? 0,

                totalTokens:

                    usage.totalTokens ?? 0,

                reasoningTokens:

                    usage.reasoningTokens ?? 0,

                cachedTokens:

                    usage.cachedTokens ?? 0

            },

            finishReason,

            retries,

            metadata,

            raw

        };

    }

}