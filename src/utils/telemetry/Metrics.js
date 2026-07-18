import path from "node:path";

import FileWriter from "./FileWriter.js";

export default class Metrics {

    constructor(config) {

        this.writer = new FileWriter(config);

        this.file = path.join(

            config.directory,

            "metrics.log"

        );

    }

    async save(data) {

        await this.writer.write(

            this.file,

            {

                time: new Date().toISOString(),

                ...data

            }

        );

    }

}