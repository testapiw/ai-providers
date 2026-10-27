export default class Billing {

    constructor(models) {

        this.models = models;

    }

    calculate(modelName, usage = {}) {

        const model = this.models[modelName];

        const pricing = model?.pricing;

        if (!pricing) {

            return {

                input: 0,

                output: 0,

                total: 0

            };

        }

        const promptTokens =
            usage.promptTokens ?? 0;

        const completionTokens =
            usage.completionTokens ?? 0;

        // кеш-read токени входять у promptTokens, але коштують дешевше
        const cachedTokens =
            Math.min(usage.cachedTokens ?? 0, promptTokens);

        const cacheWriteTokens =

            Math.min(

                usage.cacheWriteTokens ?? 0,

                promptTokens - cachedTokens

            );

        const freshTokens =
            promptTokens - cachedTokens - cacheWriteTokens;

        const inputPrice =
            pricing.input_per_1m ?? 0;

        const cachedPrice =
            pricing.cached_input_per_1m ?? inputPrice;

        const cacheWritePrice =
            pricing.cache_write_per_1m ?? inputPrice;

        const outputPrice =
            pricing.output_per_1m ?? 0;

        const input =

            (freshTokens / 1_000_000) * inputPrice +

            (cachedTokens / 1_000_000) * cachedPrice +

            (cacheWriteTokens / 1_000_000) * cacheWritePrice;

        const output =

            (completionTokens / 1_000_000) * outputPrice;

        return {

            input,

            output,

            total: input + output

        };

    }

}
