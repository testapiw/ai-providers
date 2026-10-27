import fs from "node:fs/promises";
import path from "node:path";

import FileRotation from "./FileRotation.js";
import Mutex from "./Mutex.js";

export default class FileWriter {

    static mutexes = new Map();

    constructor({

        directory = "./logs",

        maxFileSize = 3 * 1024 * 1024,

        revisions = 7

    } = {}) {

        this.directory = directory;

        this.rotation = new FileRotation({

            maxSize: maxFileSize,

            revisions

        });

        const key = path.resolve(directory);

        if (!FileWriter.mutexes.has(key)) {

            FileWriter.mutexes.set(

                key,

                new Mutex()

            );

        }

        this.mutex = FileWriter.mutexes.get(key);

    }

    async write(file, data) {

        await this.mutex.lock(async () => {

            await fs.mkdir(

                path.dirname(file),

                {

                    recursive: true

                }

            );

            await this.rotation.rotate(file);

            await fs.appendFile(

                file,

                JSON.stringify(data) + "\n",

                "utf8"

            );

        });

    }

}