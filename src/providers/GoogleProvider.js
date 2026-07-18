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

    async generate(request) {

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

        const response = await this.http.post(

            `${this.baseUrl}/v1beta/interactions`,

            {

                headers: {

                    "x-goog-api-key": this.apiKey,

                    "Api-Revision": "2026-05-20"

                },

                body

            }

        );

        let text = "";

        const outputStep = response.steps?.find(

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

            text,

            finishReason:

                response.status,

            usage: {

                promptTokens:

                    response.usage?.total_input_tokens ?? 0,

                completionTokens:

                    response.usage?.total_output_tokens ?? 0,

                totalTokens:

                    response.usage?.total_tokens ?? 0,

                reasoningTokens:

                    response.usage?.total_thought_tokens ?? 0

            },

            raw: response

        });
    }

}