export default class Cost {

    static calculate(
        modelName,
        usage = {},
        models
    ) {

        const model = models[modelName];

        if (!model) {

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

        const input =

            (promptTokens / 1_000_000) *

            model.pricing.input_per_1m;

        const output =

            (completionTokens / 1_000_000) *

            model.pricing.output_per_1m;

        return {

            input,

            output,

            total: input + output

        };

    }

}