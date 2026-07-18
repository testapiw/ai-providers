import ProviderFactory from "./ProviderFactory.js";
import Cost from "./Cost.js";

import Logger from "../utils/telemetry/Logger.js";
import Metrics from "../utils/telemetry/Metrics.js";

export default class AIClient {

    constructor(config) {

        this.config = config;

        this.models = config.models.models;

        this.telemetryEnabled =
            config.telemetry?.enabled ?? false;

        if (this.telemetryEnabled) {

            this.logger = new Logger(
                config.telemetry
            );

            this.metrics = new Metrics(
                config.telemetry
            );

        }

    }

    async generate(request) {

        const started = Date.now();

        const model = this.models[request.model];

        if (!model) {

            throw new Error(
                `Unknown model "${request.model}"`
            );

        }

        const provider = ProviderFactory.create(

            model,

            this.config.http

        );

        const payload = {

            ...request,

            temperature:

                request.temperature ??

                model.temperature,

            maxTokens:

                request.maxTokens ??

                model.maxTokens

        };

        let result;

        try {

            result = await provider.generate(
                payload
            );

        }
        catch (error) {

            const duration =
                Date.now() - started;

            Object.assign(error, {

                provider: model.provider,

                model: request.model,

                duration

            });

            if (this.telemetryEnabled) {

                await this.logger.error({

                    provider: model.provider,

                    model: request.model,

                    duration,

                    error: error.message

                });

                await this.metrics.save({

                    provider: model.provider,

                    model: request.model,

                    duration,

                    retries: error.retries ?? 0,

                    status: "error",

                    error: error.message

                });

            }

            throw error;

        }

        const duration =
            Date.now() - started;

        const usage = result.usage ?? {

            promptTokens: 0,

            completionTokens: 0,

            totalTokens: 0

        };

        const cost = Cost.calculate(

            request.model,

            usage,

            this.models

        );

        if (this.telemetryEnabled) {

            await this.logger.info({

                provider: model.provider,

                model: request.model,

                duration,

                usage,

                cost

            });

            await this.metrics.save({

                provider: model.provider,

                model: request.model,

                duration,

                promptTokens: usage.promptTokens,

                completionTokens:
                    usage.completionTokens,

                totalTokens:
                    usage.totalTokens,

                cost: cost.total,

                retries:
                    result.retries ?? 0,

                status: "success"

            });

        }

        return {

            success: true,

            provider: model.provider,

            model: request.model,

            text: result.text,

            usage,

            cost,

            duration,

            finishReason:
                result.finishReason,

            raw: result.raw

        };

    }

}