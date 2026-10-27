import fs from "node:fs/promises";

export default class FileRotation {

    constructor({
        maxSize,
        revisions
    }) {

        this.maxSize = maxSize;
        this.revisions = revisions;

    }

    async rotate(file) {

        if (!await this.needRotate(file)) {
            return;
        }

        await fs.rm(
            `${file}.${this.revisions}`,
            {
                force: true
            }
        );

        for (let i = this.revisions - 1; i >= 1; i--) {

            await this.rename(

                `${file}.${i}`,

                `${file}.${i + 1}`

            );

        }

        await this.rename(
            file,
            `${file}.1`
        );

    }

    async needRotate(file) {

        try {

            const stat = await fs.stat(file);

            return stat.size >= this.maxSize;

        }

        catch {

            return false;

        }

    }

    async rename(src, dst) {

        try {

            await fs.rename(src, dst);

        }

        catch {}

    }

}