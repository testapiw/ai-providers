export default class Mutex {

    constructor() {

        this.queue = Promise.resolve();

    }

    async lock(task) {

        const next = this.queue.then(task);

        this.queue = next.catch(() => {});

        return next;

    }

}