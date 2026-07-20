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

            "anthropic-version": "2023-06-01"

        };

    }

    buildBody(request) {

        return {

            model: this.model.apiModel,

            system: request.system,

            messages: [

                {

                    role: "user",

                    content: request.prompt

                }

            ],

            temperature: request.temperature,

            max_tokens: request.maxTokens

        };

    }

    parseResponse(response) {

        const text =

            response.body.content

                ?.map(item => item.text)

                .join("") ?? "";

        return this.result({
            
            status: response.status,

            text,

            usage: {

                promptTokens:

                    response.body.usage?.input_tokens,

                completionTokens:

                    response.body.usage?.output_tokens,

                totalTokens:

                    (response.body.usage?.input_tokens ?? 0) +

                    (response.body.usage?.output_tokens ?? 0)

            },

            finishReason:
                response.body.status,

            raw: response

        });

    }

}