import BaseProvider from "./BaseProvider.js";

export default class AnthropicProvider extends BaseProvider {

    static provider = "anthropic";

    get apiKey() {
        return process.env.ANTHROPIC_API_KEY;
    }

    get baseUrl() {

        return "https://api.anthropic.com";

    }

    buildUrl() {

        return `${this.baseUrl}/v1/messages`;

    }

    buildHeaders() {

        return {

            "x-api-key": this.apiKey,

            "anthropic-version": "2026-10-21"

        };

    }

    buildBody(request) {

        const body = {

            model: this.model.apiModel,

            messages: [

                {

                    role: "user",

                    content: request.prompt

                }

            ],

            max_tokens:
                request.maxTokens ??
                this.model.maxTokens

        };

        if (request.system) {

            body.system = request.system;

        }

        // temperature прибрано з Messages API:
        // глибина міркувань тепер задається через output_config.effort
        const effort =
            request.effort ??
            this.model.effort;

        if (effort) {

            body.output_config = { effort };

        }

        const thinking =
            request.thinking ??
            this.model.thinking;

        if (thinking) {

            body.thinking = thinking;

        }

        return body;

    }

    parseResponse(response) {

        const content =
            response.body.content ?? [];

        // thinking-блоки не мають поля .text — без фільтра
        // в текст відповіді потрапляють порожні рядки
        const text =

            content

                .filter(item => item.type === "text")

                .map(item => item.text)

                .join("");

        const usage =
            response.body.usage ?? {};

        // input_tokens не включає кешовані токени, тому додаємо їх,
        // щоб promptTokens означав усі вхідні токени (як в OpenAI)
        const promptTokens =

            (usage.input_tokens ?? 0) +

            (usage.cache_read_input_tokens ?? 0) +

            (usage.cache_creation_input_tokens ?? 0);

        const completionTokens =
            usage.output_tokens ?? 0;

        return this.result({

            status: response.status,

            text,

            usage: {

                promptTokens,

                completionTokens,

                totalTokens:
                    promptTokens + completionTokens,

                cachedTokens:
                    usage.cache_read_input_tokens ?? 0,

                cacheWriteTokens:
                    usage.cache_creation_input_tokens ?? 0

            },

            finishReason:
                response.body.stop_reason ?? null,

            raw: response

        });

    }

}
