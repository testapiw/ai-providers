import Plugin from "../../core/Plugin.js";
import Billing from "./Billing.js";

export default class BillingPlugin extends Plugin {

    constructor(config = {}) {

        super(config);

    }
    
    install(ai) {

        this.billing = new Billing(ai.models);

        ai.on("request:success", context => {

            context.cost = this.billing.calculate(
                context.model,
                context.usage
            );

        });

    }

}