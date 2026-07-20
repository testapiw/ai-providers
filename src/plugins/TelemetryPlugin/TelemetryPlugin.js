import Plugin from "../../core/Plugin.js";
import Logger from "./Logger.js";
import Metrics from "./Metrics.js";

export default class TelemetryPlugin extends Plugin {

    constructor(config = {}) {

        super();

        this.logger = new Logger(config);

        this.metrics = new Metrics(config);

    }

    install(ai) {

        ai.on(

            "request:success",

            context => this.success(context)

        );

        ai.on(

            "request:error",

            context => this.error(context)

        );

    }

    async success(context) {

        await this.logger.info(context);

        await this.metrics.save(context);

    }

    async error(context) {

        await this.logger.error(context);

        await this.metrics.save(context);

    }

}
