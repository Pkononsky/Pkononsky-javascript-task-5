'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;
const DEFAULT_FREQ = 1;
const DEFAULT_TIMES = -1;
const COUNTER_START = 1;

function getEventObjects(events, event) {
    return event in events ? events[event] : [];
}

function getExecuteInformation(frequency, times) {
    return { frequency: frequency, execCounter: COUNTER_START, times: times };
}

function getNewEventObj(event, context, handler) {
    return { event: event, context: context, handler: handler };
}

function subscribeToEvent(events, newEventData, frequency = DEFAULT_FREQ, times = DEFAULT_TIMES) {
    let event = newEventData.event;
    let context = newEventData.context;
    let handler = newEventData.handler;

    events[event] = getEventObjects(events, event);
    let execInfo = getExecuteInformation(frequency, times);
    events[event].push({ context: context, handler: handler, execInfo: execInfo });
}

function getDefaultOrLeave(value, defaultValue) {
    return value <= 0 ? defaultValue : value;
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
            let newEventData = getNewEventObj(event, context, handler);
            subscribeToEvent(events, newEventData);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            events[event] = events[event].filter((eventObj) => {
                return eventObj.context !== context;
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
                eventObjects.forEach((eventObj) => {
                    eventObj.execInfo.execCounter++;
                    eventObj.execInfo.execCounter %= eventObj.execInfo.frequency;
                    if (eventObj.execInfo.times !== 0 && eventObj.execInfo.execCounter === 0) {
                        eventObj.execInfo.times--;
                        eventObj.handler.call(eventObj.context);
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
            times = getDefaultOrLeave(times, DEFAULT_TIMES);
            let newEventData = getNewEventObj(event, context, handler);
            subscribeToEvent(events, newEventData, DEFAULT_FREQ, times);

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
            let newEventData = getNewEventObj(event, context, handler);
            subscribeToEvent(events, newEventData, frequency, DEFAULT_TIMES);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
