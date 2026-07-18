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

        const choice = response.choices?.[0];

        return this.result({

            text: choice?.message?.content,

            finishReason: choice?.finish_reason,

            usage: {

                promptTokens:
                    response.usage?.prompt_tokens,

                completionTokens:
                    response.usage?.completion_tokens,

                totalTokens:
                    response.usage?.total_tokens

            },

            raw: response

        });

    }

}