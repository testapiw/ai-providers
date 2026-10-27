export default class EventEmitter {

    constructor() {

        this.events = new Map();

    }

    on(event, listener) {

        if (!this.events.has(event)) {

            this.events.set(event, []);

        }

        this.events.get(event).push(listener);

        return this;

    }

    off(event, listener) {

        const listeners = this.events.get(event);

        if (!listeners) {
            return this;
        }

        this.events.set(

            event,

            listeners.filter(fn => fn !== listener)

        );

        return this;

    }

    once(event, listener) {

        const wrapper = (...args) => {

            this.off(event, wrapper);

            listener(...args);

        };

        return this.on(event, wrapper);

    }

    async emit(event, payload) {

        const listeners = this.events.get(event);

        if (!listeners?.length) {
            return;
        }

        for (const listener of listeners) {

            await listener(payload);

        }

    }

}