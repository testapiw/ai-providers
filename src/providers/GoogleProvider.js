import BaseProvider from "./BaseProvider.js";

export default class GoogleProvider extends BaseProvider {

    static provider = "google";

    get apiKey() {

        return this.model.apiTier === "free"
            ? process.env.GEMINI_API_KEY_FREE
            : process.env.GEMINI_API_KEY_PAID;
    }

    get baseUrl() {

        return "https://generativelanguage.googleapis.com";

    }

    buildUrl() {
        return `${this.baseUrl}/v1beta/interactions`;
    }

    buildHeaders() {
        return {

                    "x-goog-api-key": this.apiKey,

                    "Api-Revision": "2026-05-20"

                };
    }

    buildBody(request) {

        const body = {

            model: this.model.apiModel,

            input: request.prompt,

            generation_config: {

                temperature: request.temperature,

                max_output_tokens: request.maxTokens

            }

        };

        if (request.system) {

            body.system_instruction = request.system;

        }

        return body;

    }

    parseResponse(response) {

        let text = "";

        const outputStep = response.body.steps?.find(

            step => step.type === "model_output"

        );

        if (outputStep?.content) {

            for (const part of outputStep.content) {

                if (part.type === "text") {

                    text += part.text;

                }

            }

        }

        return this.result({

            status: response.status,

            text,

            usage: {

                promptTokens:
                    response.body.usage?.total_input_tokens ?? 0,

                completionTokens:
                    response.body.usage?.total_output_tokens ?? 0,

                totalTokens:
                    response.body.usage?.total_tokens ?? 0,

                reasoningTokens:
                    response.body.usage?.total_thought_tokens ?? 0,

                cachedTokens:
                    response.body.usage?.total_cached_tokens ?? 0

            },

            finishReason:
                response.body.status,

            raw: response

        });

    }
}