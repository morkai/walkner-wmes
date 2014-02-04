define(function (require, exports, module) {/*jshint unused:false*/

'use strict';

module.exports = Broker;

/**
 * @name h5.pubsub.Broker
 * @interface
 */
function Broker() {}

Broker.prototype.destroy = function() {};

/**
 * @returns {h5.pubsub.Sandbox}
 */
Broker.prototype.sandbox = function() {};

/**
 * @param {string} topic
 * @param {*} [message]
 * @param {object} [meta]
 * @throws {Error} If the specified topic is invalid.
 */
Broker.prototype.publish = function(topic, message, meta) {};

/**
 * @param {string} topic
 * @param {function(string, *, object)} [onMessage]
 * @returns {h5.pubsub.Subscription}
 * @throws {Error} If the specified topic is invalid.
 */
Broker.prototype.subscribe = function(topic, onMessage) {};

/**
 * @param {string} topic
 * @returns {h5.pubsub.Broker}
 * @throws {Error} If the specified topic is invalid.
 */
Broker.prototype.unsubscribe = function(topic) {};

});
