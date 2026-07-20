import BaseProvider from "./BaseProvider.js";

export default class DeepSeekProvider extends BaseProvider {

    static provider = "deepseek";

    get apiKey() {
        return process.env.DEEPSEEK_API_KEY;
    }

    get baseUrl() {
        return "https://api.deepseek.com/v1";
    }

    buildUrl() {
        return `${this.baseUrl}/chat/completions`;
    }

    buildHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`
        };
    }

    buildBody(request) {

        const messages = [];

        if (request.system) {
            messages.push({
                role: "system",
                content: request.system
            });
        }

        messages.push({
            role: "user",
            content: request.prompt
        });

        return {

            model: this.model.apiModel,

            messages,

            temperature:
                request.temperature ??
                this.model.temperature,

            max_tokens:
                request.maxTokens ??
                this.model.maxTokens,

            stream: false

        };

    }

    parseResponse(response) {

        const choice = response.body.choices?.[0];

        return this.result({

            status: response.status,

            text: choice?.message?.content,

            usage: {

                promptTokens:
                    response.body.usage?.prompt_tokens,

                completionTokens:
                    response.body.usage?.completion_tokens,

                totalTokens:
                    response.body.usage?.total_tokens,

                reasoningTokens:
                    response.body.usage?.total_thought_tokens ?? 0,

                cachedTokens:
                    response.body.usage?.prompt_cache_hit_tokens ?? 0  // prompt_cache_hit_tokens

            },

            finishReason:
                response.body.status,

            raw: response

        });

    }

}