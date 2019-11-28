'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        events: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            if (!Object.keys(this.events).includes(event)) {
                this.events[event] = [];
            }
            const contextEvent = {
                context: context,
                handler: handler
            };
            this.events[event].push(contextEvent);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            const offEvents = Object.keys(this.events)
                .filter(key => (key.startsWith(`${event}.`) || key === event));
            for (const offEvent of offEvents) {
                const eventIndex = this.events[offEvent].findIndex(e => e.context === context);
                this.events[offEvent].splice(eventIndex, 1);
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            const eventSplit = event.split('.');
            const events = [eventSplit[0]];
            for (let i = 1; i < eventSplit.length; i++) {
                events.push(`${events[i - 1]}.${eventSplit[i]}`);
            }
            events.reverse();

            for (const e of events) {
                if (!Object.keys(this.events).includes(e)) {
                    continue;
                }
                const eventsToEmit = this.events[e];
                eventsToEmit.forEach(eventEmit => {
                    if (eventEmit.times) {
                        checkSeveral(eventEmit);
                    } else if (eventEmit.frequency) {
                        checkThrough(eventEmit);
                    } else {
                        eventEmit.handler.call(eventEmit.context);
                    }
                });
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            this.on(event, context, handler);
            const action = this.events[event].find(e => e.context === context);
            action.times = times;
            action.emitTimes = 0;

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, handler);
            const action = this.events[event].find(e => e.context === context);
            action.frequency = frequency;
            action.emitTimes = 0;

            return this;
        }
    };
}

function checkSeveral(eventEmit) {
    if (eventEmit.times > eventEmit.emitTimes++) {
        eventEmit.handler.call(eventEmit.context);
    }
}

function checkThrough(eventEmit) {
    if (eventEmit.emitTimes++ % eventEmit.frequency === 0) {
        eventEmit.handler.call(eventEmit.context);
    }
}

module.exports = {
    getEmitter,

    isStar
};
