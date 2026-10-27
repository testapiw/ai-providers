export default class Plugin {

    constructor(config = {}) {

        this.config = config;

    }

    install(ai) {

        throw new Error("Not implemented");

    }

}