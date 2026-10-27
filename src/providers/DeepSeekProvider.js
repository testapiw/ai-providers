import BaseProvider from "./BaseProvider.js";

export default class DeepSeekProvider extends BaseProvider {

    static provider = "deepseek";

    get apiKey() {
        return process.env.DEEPSEEK_API_KEY;
    }

    get baseUrl() {

        // офіційний base_url без суфікса /v1
        return "https://api.deepseek.com";
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

        const body = {

            model: this.model.apiModel,

            messages,

            max_tokens:
                request.maxTokens ??
                this.model.maxTokens,

            stream: false

        };

        const temperature =
            request.temperature ??
            this.model.temperature;

        if (

            temperature != null &&
            this.model.capabilities?.temperature !== false

        ) {

            body.temperature = temperature;

        }

        const thinking =
            request.thinking ??
            this.model.thinking;

        if (thinking) {

            // { type: "enabled" } | { type: "disabled" }
            body.thinking = thinking;

        }

        const effort =
            request.effort ??
            this.model.effort;

        if (effort) {

            body.reasoning_effort = effort;

        }

        return body;

    }

    parseResponse(response) {

        const choice =
            response.body.choices?.[0];

        const usage =
            response.body.usage ?? {};

        return this.result({

            status: response.status,

            text:
                choice?.message?.content ?? "",

            usage: {

                promptTokens:
                    usage.prompt_tokens ?? 0,

                completionTokens:
                    usage.completion_tokens ?? 0,

                totalTokens:

                    usage.total_tokens ??

                    (usage.prompt_tokens ?? 0) +
                    (usage.completion_tokens ?? 0),

                reasoningTokens:
                    usage.completion_tokens_details?.reasoning_tokens ?? 0,

                cachedTokens:
                    usage.prompt_tokens_details?.cached_tokens ??
                    usage.prompt_cache_hit_tokens ?? 0

            },

            finishReason:
                choice?.finish_reason ?? null,

            raw: response

        });

    }

}
