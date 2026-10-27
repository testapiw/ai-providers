import BaseProvider from "./BaseProvider.js";

export default class OpenAIProvider extends BaseProvider {

    static provider = "openai";

    get apiKey() {

        return process.env.OPENAI_API_KEY;

    }

    get baseUrl() {

        return "https://api.openai.com/v1";

    }

    buildUrl() {

        return `${this.baseUrl}/responses`;

    }

    buildHeaders() {

        return {

            Authorization: `Bearer ${this.apiKey}`

        };

    }

    buildBody(request) {

        const body = {

            model: this.model.apiModel,

            input: [

                {

                    role: "user",

                    content: [

                        {

                            type: "input_text",

                            text: request.prompt

                        }

                    ]

                }

            ],

            max_output_tokens:
                request.maxTokens ??
                this.model.maxTokens,

            // дефолт API — store: true (збереження 30 днів),
            // для SDK це небажано, тому явно вимикаємо
            store:
                request.store ??
                this.model.store ??
                false

        };

        if (request.system) {

            body.instructions = request.system;

        }

        // temperature підтримують не всі reasoning-моделі,
        // тому орієнтуємось на capability-прапорець у конфігу моделі
        const temperature =
            request.temperature ??
            this.model.temperature;

        if (

            temperature != null &&
            this.model.capabilities?.temperature !== false

        ) {

            body.temperature = temperature;

        }

        const effort =
            request.effort ??
            this.model.effort;

        if (effort) {

            // none | minimal | low | medium | high | xhigh | max
            body.reasoning = { effort };

        }

        const cacheKey =
            request.cacheKey ??
            this.model.cacheKey;

        if (cacheKey) {

            body.prompt_cache_key = cacheKey;

        }

        return body;

    }

    parseResponse(response) {

        // текст може бути в кількох message-елементах output
        const text =

            (response.body.output ?? [])

                .filter(item => item.type === "message")

                .flatMap(item => item.content ?? [])

                .filter(item => item.type === "output_text")

                .map(item => item.text)

                .join("");

        const usage =
            response.body.usage ?? {};

        return this.result({

            text,

            status: response.status,

            usage: {

                promptTokens:
                    usage.input_tokens ?? 0,

                completionTokens:
                    usage.output_tokens ?? 0,

                totalTokens:
                    usage.total_tokens ?? 0,

                reasoningTokens:
                    usage.output_tokens_details?.reasoning_tokens ?? 0,

                cachedTokens:
                    usage.input_tokens_details?.cached_tokens ?? 0

            },

            // status = completed/incomplete, причина обрізки — в incomplete_details
            finishReason:

                response.body.incomplete_details?.reason ??

                response.body.status ?? null,

            raw: response

        });

    }

}
