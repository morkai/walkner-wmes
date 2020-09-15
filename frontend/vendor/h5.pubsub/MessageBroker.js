define(function (require, exports, module) {'use strict';

var Subscriptions = require('./Subscriptions');
var Subscription = require('./Subscription');
var Sandbox = require('./Sandbox');

module.exports = MessageBroker;

/**
 * @name h5.pubsub.MessageBroker
 * @constructor
 * @implements {h5.pubsub.Broker}
 */
function MessageBroker()
{
  /**
   * @private
   * @type {h5.pubsub.Subscriptions}
   */
  this.subscriptions = new Subscriptions(this);

  /**
   * @private
   * @type {number}
   */
  this.nextSubscriptionId = 0;

  /**
   * @type {object.<string, Array.<function>>}
   */
  this.listeners = {
    'subscribe': [],
    'cancel': [],
    'new topic': [],
    'empty topic': [],
    'message': []
  };
}

MessageBroker.prototype.destroy = function()
{
  this.subscriptions.destroy();

  this.listeners = {};
};

/**
 * @returns {h5.pubsub.Sandbox}
 */
MessageBroker.prototype.sandbox = function()
{
  return new Sandbox(this);
};

/**
 * @param {string} topic
 * @param {*} [message]
 * @param {object} [meta]
 * @throws {Error} If the specified topic is invalid.
 */
MessageBroker.prototype.publish = function(topic, message, meta)
{
  if (typeof meta === 'undefined')
  {
    meta = {};
  }

  this.emit('message', topic, message, meta);

  this.subscriptions.send(topic, message, meta);

  return this;
};

/**
 * @param {string} topic
 * @param {function(string, *, object)} [onMessage]
 * @returns {h5.pubsub.Subscription}
 * @throws {Error} If the specified topic is invalid.
 */
MessageBroker.prototype.subscribe = function(topic, onMessage)
{
  var subscription = new Subscription(this.getNextSubscriptionId(), topic);

  if (typeof onMessage === 'function')
  {
    subscription.on('message', onMessage);
  }

  this.subscriptions.add(subscription);

  this.emit('subscribe', subscription);

  return subscription;
};

/**
 * @param {string} topic
 * @returns {h5.pubsub.MessageBroker}
 * @throws {Error} If the specified topic is invalid.
 */
MessageBroker.prototype.unsubscribe = function(topic)
{
  this.subscriptions.remove(topic);

  return this;
};

/**
 * @returns {object.<string, number>}
 */
MessageBroker.prototype.count = function()
{
  var result = {};

  if (this.subscriptions === null)
  {
    return result;
  }

  var prefix = '';

  this.subscriptions.count(prefix, result);

  return result;
};

/**
 * @param {string} event
 * @param {function} callback
 * @returns {h5.pubsub.MessageBroker}
 * @throws {Error} If the specified event is unknown.
 */
MessageBroker.prototype.on = function(event, callback)
{
  var listeners = this.listeners[event];
  var listenersType = typeof listeners;

  if (listenersType === 'undefined')
  {
    throw new Error("Unknown event: " + event);
  }

  listeners.push(callback);

  return this;
};

/**
 * @param {string} event
 * @param {function} callback
 * @returns {h5.pubsub.MessageBroker}
 * @throws {Error} If the specified event is unknown.
 */
MessageBroker.prototype.off = function(event, callback)
{
  var listeners = this.listeners[event];
  var listenersType = typeof listeners;

  if (listenersType === 'undefined')
  {
    throw new Error("Unknown event: " + event);
  }

  var listenerIndex = listeners.indexOf(callback);

  if (listenerIndex !== -1)
  {
    listeners.splice(listenerIndex, 1);
  }

  return this;
};

/**
 * @param {string} event
 * @param {...*} args
 * @returns {h5.pubsub.MessageBroker}
 * @throws {Error} If the specified event is unknown.
 */
MessageBroker.prototype.emit = function(event, args)
{
  var listeners = this.listeners[event];
  var listenersType = typeof listeners;

  if (listenersType === 'undefined')
  {
    throw new Error("Unknown event: " + event);
  }

  if (!listeners.length)
  {
    return this;
  }

  var argCount = arguments.length;

  if (argCount > 4)
  {
    args = Array.prototype.slice.call(arguments);
    args.shift();
  }

  for (var i = 0, l = listeners.length; i < l; ++i)
  {
    var listener = listeners[i];

    switch (argCount)
    {
      case 4:
        listener(arguments[1], arguments[2], arguments[3]);
        break;

      case 3:
        listener(arguments[1], arguments[2]);
        break;

      case 2:
        listener(arguments[1]);
        break;

      default:
        listener.apply(null, args);
    }
  }

  return this;
};

/**
 * @private
 * @returns {string}
 */
MessageBroker.prototype.getNextSubscriptionId = function()
{
  return (this.nextSubscriptionId++).toString(36);
};

});
