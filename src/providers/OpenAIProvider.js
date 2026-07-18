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
    const input = [];

    if (request.system) {
        input.push({
            role: "system",
            content: [
                {
                    type: "input_text",
                    text: request.system
                }
            ]
        });
    }

    input.push({
        role: "user",
        content: [
            {
                type: "input_text",
                text: request.prompt
            }
        ]
    });

    const body = {
        model: this.model.apiModel,
        input,
        max_output_tokens: request.maxTokens ?? this.model.maxTokens
    };

    // Модели gpt-5 и o-серии не поддерживают сэмплинг через temperature
    const isReasoningModel = this.model.apiModel.startsWith('gpt-5') || this.model.apiModel.startsWith('o');

    if (!isReasoningModel) {
        body.temperature = request.temperature ?? this.model.temperature;
    }

    return body;
}

    parseResponse(response) {

        const output =

            response.output?.find(

                item => item.type === "message"

            );

        const text =

            output?.content?.find(

                item => item.type === "output_text"

            )?.text ?? "";

        return this.result({

            text,

            finishReason:
                response.status,

            usage: {

                promptTokens:
                    response.usage?.input_tokens,

                completionTokens:
                    response.usage?.output_tokens,

                totalTokens:
                    response.usage?.total_tokens,

                reasoningTokens:
                    response.usage?.output_tokens_details?.reasoning_tokens,

                cachedTokens:
                    response.usage?.input_tokens_details?.cached_tokens

            },

            raw: response

        });

    }

}