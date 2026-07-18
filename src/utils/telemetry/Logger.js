import path from "node:path";

import FileWriter from "./FileWriter.js";

export default class Logger {

    constructor(config) {

        this.writer = new FileWriter(config);

        this.aiLog = path.join(

            config.directory,

            "ai.log"

        );

        this.errorLog = path.join(

            config.directory,

            "errors.log"

        );

    }

    async info(data) {

        await this.writer.write(

            this.aiLog,

            {

                level: "info",

                time: new Date().toISOString(),

                ...data

            }

        );

    }

    async error(data) {

        await this.writer.write(

            this.errorLog,

            {

                level: "error",

                time: new Date().toISOString(),

                ...data

            }

        );

    }

}