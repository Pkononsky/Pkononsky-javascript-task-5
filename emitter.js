'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;
const DEFAULT_FREQ = 1;
const DEFAULT_TIMES = Infinity;
const COUNTER_START = 0;

function getEventObjects(events, event) {
    return event in events ? events[event] : [];
}

function getExecuteInformation(frequency, times) {
    return { frequency: frequency, execCounter: COUNTER_START, times: times };
}

function createEventObject(context, handler, frequency = DEFAULT_FREQ, times = DEFAULT_TIMES) {
    let execInfo = getExecuteInformation(frequency, times);

    return { context: context, handler: handler, execInfo: execInfo };
}

function getDefaultOrLeave(value, defaultValue) {
    return value <= 0 ? defaultValue : value;
}

function getSpecificEvents(events, event) {
    let specificEvents = [event];
    event += '.';
    specificEvents = specificEvents.concat(Object.keys(events).filter((eventName) => {
        return eventName.includes(event);
    }));

    return specificEvents;
}

function executeEvents(eventObjects) {
    eventObjects.forEach((eventObj) => {
        eventObj.execInfo.execCounter %= eventObj.execInfo.frequency;
        if (eventObj.execInfo.times > 0 && eventObj.execInfo.execCounter === 0) {
            eventObj.execInfo.times--;
            eventObj.handler.call(eventObj.context);
        }
        eventObj.execInfo.execCounter++;
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
            events[event] = getEventObjects(events, event);
            events[event].push(createEventObject(context, handler));

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            let specificEvents = getSpecificEvents(events, event);

            specificEvents.forEach((eventName) => {
                let eventObjects = getEventObjects(events, eventName);
                if (eventObjects.length === 0) {
                    return false;
                }
                events[eventName] = events[eventName].filter((eventObj) => {
                    return eventObj.context !== context;
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
                let eventObjects = getEventObjects(events, eventName);
                executeEvents(eventObjects);
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
            times = getDefaultOrLeave(times, DEFAULT_TIMES);
            events[event] = getEventObjects(events, event);
            events[event].push(createEventObject(context, handler, DEFAULT_FREQ, times));

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
            frequency = getDefaultOrLeave(frequency, DEFAULT_FREQ);
            events[event] = getEventObjects(events, event);
            events[event].push(createEventObject(context, handler, frequency, DEFAULT_TIMES));

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
