'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;
const FREQ = 1;
const TIMES = Infinity;
const COUNTER_START = 0;

function getEventsByName(events, eventName) {
    return events[eventName] || [];
}

function getAllowableValue(value, defaultValue) {
    return value <= 0 ? defaultValue : value;
}

function createNewEventsList({ exEvents, context, handler, frequency = FREQ, times = TIMES }) {
    times = getAllowableValue(times, TIMES);
    frequency = getAllowableValue(frequency, FREQ);
    let execInfo = { frequency, execCounter: COUNTER_START, times };
    exEvents.push({ context, handler, execInfo });

    return exEvents;
}

function getEventsByNameBeginning(events, event) {
    let specificEvents = [event];
    event += '.';
    specificEvents = specificEvents.concat(Object.keys(events).filter((eventName) => {
        return eventName.indexOf(event) === 0;
    }));

    return specificEvents;
}

function executeEvents(events) {
    events.forEach((event) => {
        event.execInfo.execCounter %= event.execInfo.frequency;
        if (event.execInfo.times > 0 && event.execInfo.execCounter === 0) {
            event.execInfo.times--;
            event.handler.call(event.context);
        }
        event.execInfo.execCounter++;
    });
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            events[event] = createNewEventsList({
                exEvents: getEventsByName(events, event),
                context,
                handler,
                FREQ,
                TIMES
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            getEventsByNameBeginning(events, event).forEach((eventName) => {
                events[eventName] = getEventsByName(events, eventName).filter((val) => {
                    return val.context !== context;
                });
            });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            let eventWords = event.split('.');
            let lastIndex = eventWords.length + 1;
            while (lastIndex--) {
                let eventName = eventWords.slice(0, lastIndex).join('.');
                executeEvents(getEventsByName(events, eventName));
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
            events[event] = createNewEventsList({
                exEvents: getEventsByName(events, event),
                context,
                handler,
                FREQ,
                times
            });

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
            events[event] = createNewEventsList({
                exEvents: getEventsByName(events, event),
                context,
                handler,
                frequency,
                TIMES
            });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
