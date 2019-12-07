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
            const contextEvent = {
                context: context,
                handler: handler
            };
            this._addContextEventToEvents(contextEvent, event);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            const offEvents = Object.keys(this.events);
            for (const offEvent of offEvents) {
                if (offEvent.startsWith(`${event}.`) || offEvent === event) {
                    this.events[offEvent] = this.events[offEvent]
                        .filter(eventContext => eventContext.context !== context);
                }
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
                if (!this.events[e]) {
                    continue;
                }

                const eventsToEmit = this.events[e];
                eventsToEmit.forEach(eventEmit => {
                    if (eventEmit.times > 0) {
                        this._checkSeveral(eventEmit);
                    } else if (eventEmit.frequency > 0) {
                        this._checkThrough(eventEmit);
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
            const contextEvent = {
                context: context,
                handler: handler,
                times: times,
                emitTimes: 0
            };
            this._addContextEventToEvents(contextEvent, event);

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
            const contextEvent = {
                context: context,
                handler: handler,
                frequency: frequency,
                emitTimes: 0
            };
            this._addContextEventToEvents(contextEvent, event);

            return this;
        },

        _addContextEventToEvents: function (contextEvent, event) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(contextEvent);
        },

        _checkSeveral: function (eventEmit) {
            if (eventEmit.times > eventEmit.emitTimes++) {
                eventEmit.handler.call(eventEmit.context);
            }
        },

        _checkThrough: function (eventEmit) {
            if (eventEmit.emitTimes++ % eventEmit.frequency === 0) {
                eventEmit.handler.call(eventEmit.context);
            }
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
