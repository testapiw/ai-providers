import EventEmitter from "./EventEmitter.js";
import ProviderFactory from "./ProviderFactory.js";
import Plugin from "./Plugin.js";

export default class AIClient extends EventEmitter {

    constructor(config) {

        super();

        this.config = config;

        this._models = config.models.models;

    }

    get models() {

        return this._models;

    }

    async generate(request) {

        const started = Date.now();

        const model = this._models[request.model];

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

        const context = {

            provider: model.provider,

            model: request.model,

            request: payload

        };

        await this.emit(

            "request:start",

            context

        );

        try {

            const result = await provider.generate(

                payload

            );

            Object.assign(context, {

                success: true,

                status: result.status,

                text: result.text,

                usage: result.usage ?? {

                    promptTokens: 0,

                    completionTokens: 0,

                    totalTokens: 0

                },

                duration:

                    Date.now() - started,

                finishReason:

                    result.finishReason,

                raw: result.raw

            });

            await this.emit(

                "request:success",

                context

            );

            return context;

        }

        catch (error) {

            Object.assign(context, {

                success: false,

                status: error.status,

                duration:

                    Date.now() - started,

                error

            });

            await this.emit(

                "request:error",

                context

            );

            throw error;

        }

        finally {

            await this.emit(

                "request:finish",

                context

            );

        }

    }

    plugins(...plugins) {

        for (const plugin of plugins.flat()) {

            this.use(plugin);

        }

        return this;

    }

    use(plugin) {

        this.#isPlugin(plugin);

        plugin.install(this);

        return this;

    }

    #isPlugin(plugin) {

        if (!(plugin instanceof Plugin)) {

            throw new TypeError(

                `${plugin?.constructor?.name ?? plugin} is not a Plugin`

            );

        }

    }
}