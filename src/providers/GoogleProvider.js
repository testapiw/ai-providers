import BaseProvider from "./BaseProvider.js";

// Interactions API не знає temperature: глибина міркувань (thinking_level)
// є єдиним параметром, що впливає на «творчість» відповіді
export default class GoogleProvider extends BaseProvider {

    static provider = "google";

    // ThinkingLevel: minimal | low | medium | high
    static EFFORT_LEVELS = {

        none: "minimal",

        minimal: "minimal",

        low: "low",

        medium: "medium",

        high: "high",

        xhigh: "high",

        max: "high"

    };

    get apiKey() {

        return this.model.apiTier === "free"
            ? process.env.GEMINI_API_KEY_FREE
            : process.env.GEMINI_API_KEY_PAID;

    }

    get baseUrl() {

        return "https://generativelanguage.googleapis.com";

    }

    buildUrl() {

        // стабільний шлях Interactions — /v1beta/interactions
        return `${this.baseUrl}/v1beta/interactions`;

    }

    buildHeaders() {

        // Api-Revision більше не потрібен: після 2026-06-08 заголовок ігнорується
        return {

            "x-goog-api-key": this.apiKey

        };

    }

    buildBody(request) {

        const generation_config = {};

        const maxTokens =
            request.maxTokens ??
            this.model.maxTokens;

        if (maxTokens != null) {

            generation_config.max_output_tokens = maxTokens;

        }

        // набір допустимих thinking_level відрізняється по моделях
        // (наприклад, gemini-3.8-flash відхиляє minimal), тому дефолт із конфігу
        // не застосовуємо — рівень надсилаємо лише коли його явно передав користувач
        const effort = request.effort;

        if (effort) {

            generation_config.thinking_level =

                GoogleProvider.EFFORT_LEVELS[effort] ??
                effort;

        }

        const body = {

            model: this.model.apiModel,

            input: request.prompt

        };

        if (Object.keys(generation_config).length) {

            body.generation_config = generation_config;

        }

        if (request.system) {

            body.system_instruction = request.system;

        }

        return body;

    }

    parseResponse(response) {

        const usage =
            response.body.usage ?? {};

        // після міграції відповідь лежить у steps (раніше outputs),
        // текст може бути розбитий на кілька model_output-кроків
        const text =

            (response.body.steps ?? [])

                .filter(step => step.type === "model_output")

                .flatMap(step => step.content ?? [])

                .filter(part => part.type === "text")

                .map(part => part.text)

                .join("");

        const promptTokens =
            usage.total_input_tokens ?? 0;

        const reasoningTokens =
            usage.total_thought_tokens ?? 0;

        // total_output_tokens не містить thought-токени, але total_tokens містить,
        // і Google тарифікує thoughts як output — тому додаємо їх до completionTokens
        const completionTokens =

            (usage.total_output_tokens ?? 0) +

            reasoningTokens;

        const status =
            response.body.status ?? null;

        return this.result({

            status: response.status,

            text,

            usage: {

                promptTokens,

                completionTokens,

                totalTokens:

                    usage.total_tokens ??
                    promptTokens + completionTokens,

                reasoningTokens,

                cachedTokens:
                    usage.total_cached_tokens ?? 0

            },

            // completed | incomplete | requires_action | cancelled | failed
            finishReason: status,

            raw: response

        });

    }
}
