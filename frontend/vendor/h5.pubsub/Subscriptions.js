define(function (require, exports, module) {'use strict';

module.exports = Subscriptions;

var EMPTY_TOPIC_PARTS = [];

/**
 * @name h5.pubsub.Subscriptions
 * @constructor
 * @param {h5.pubsub.MessageBroker} messageBroker
 */
function Subscriptions(messageBroker)
{
  /**
   * @private
   * @type {h5.pubsub.MessageBroker}
   */
  this.messageBroker = messageBroker;

  /**
   * @private
   * @type {object.<string, h5.pubsub.Subscriptions>}
   */
  this.children = {};

  /**
   * @private
   * @type {Array.<h5.pubsub.Subscription>}
   */
  this.subscriptions = [];

  /**
   * @private
   * @type {Array.<h5.pubsub.Subscription>}
   */
  this.subscriptionsPendingRemoval = [];

  /**
   * @private
   * @type {number}
   */
  this.sendingMessagesCount = 0;

  /**
   * @private
   * @type {function(h5.pubsub.Subscription)}
   */
  this.removeSubscription = this.removeSubscription.bind(this);
}

Subscriptions.TOKEN = {
  SEPARATOR: '.',
  ANY: '*',
  ALL: '**'
};

Subscriptions.prototype.destroy = function()
{
  var children = this.children;
  var childTopicParts = Object.keys(children);

  for (var i = 0, l = childTopicParts.length; i < l; ++i)
  {
    children[childTopicParts[i]].destroy();
  }

  this.children = null;

  this.removeSubscriptions();

  this.subscriptionsPendingRemoval = null;
  this.messageBroker = null;
};

/**
 * @param {string} prefix
 * @param {object.<string, number>} result
 */
Subscriptions.prototype.count = function(prefix, result)
{
  if (this.subscriptions.length)
  {
    result[prefix] = this.subscriptions.length;
  }

  var childTopicParts = Object.keys(this.children);
  var l = childTopicParts.length;

  if (!l)
  {
    return;
  }

  if (prefix.length !== 0)
  {
    prefix += Subscriptions.TOKEN.SEPARATOR;
  }

  for (var i = 0; i < l; ++i)
  {
    var childTopicPart = childTopicParts[i];

    this.children[childTopicPart].count(prefix + childTopicPart, result);
  }
};

/**
 * @param {h5.pubsub.Subscription} subscription
 * @throws {Error} If the subscription topic is not valid.
 */
Subscriptions.prototype.add = function(subscription)
{
  var topicParts = this.splitTopic(subscription.getTopic());

  this.addSubscription(topicParts, subscription);
};

/**
 * @param {string} topic
 * @throws {Error} If the subscription topic is not valid.
 */
Subscriptions.prototype.remove = function(topic)
{
  this.removeSubscriptions(this.splitTopic(topic));
};

/**
 * @param {string} topic
 * @param {*} message
 * @param {object} meta
 * @throws {Error} If the specified topic is not valid.
 */
Subscriptions.prototype.send = function(topic, message, meta)
{
  var topicParts = this.splitTopic(topic);

  this.sendMessage(topicParts, topic, message, meta);
};

/**
 * @private
 * @param {Array.<string>} topicParts
 * @param {h5.pubsub.Subscription} subscription
 */
Subscriptions.prototype.addSubscription = function(topicParts, subscription)
{
  if (topicParts.length === 0)
  {
    this.subscriptions.push(subscription);

    subscription.on('cancel', this.removeSubscription);

    if (this.subscriptions.length === 1)
    {
      this.messageBroker.emit('new topic', subscription.getTopic());
    }

    return;
  }

  var children = this.children;
  var topicPart = topicParts.shift();

  if (typeof children[topicPart] === 'undefined')
  {
    children[topicPart] = new Subscriptions(this.messageBroker);
  }

  children[topicPart].addSubscription(topicParts, subscription);
};

/**
 * @private
 * @param {Array.<string>=} topicParts
 */
Subscriptions.prototype.removeSubscriptions = function(topicParts)
{
  var i;
  var l;

  if (typeof topicParts === 'undefined' || topicParts.length === 0)
  {
    var subscriptions = this.subscriptions;

    if (!subscriptions.length)
    {
      return;
    }

    this.subscriptions = [];

    var emptyTopic = subscriptions[0].getTopic();

    for (i = 0, l = subscriptions.length; i < l; ++i)
    {
      subscriptions[i].cancel();
    }

    this.messageBroker.emit('empty topic', emptyTopic);

    return;
  }

  var topicPart = topicParts.shift();

  if (typeof this.children[topicPart] !== 'undefined')
  {
    this.children[topicPart].removeSubscriptions(topicParts);
  }
};

/**
 * @private
 * @param {Array.<string>} topicParts
 * @param {string} topic
 * @param {*} message
 * @param {object} meta
 */
Subscriptions.prototype.sendMessage = function(topicParts, topic, message, meta)
{
  ++this.sendingMessagesCount;

  if (typeof this.children[Subscriptions.TOKEN.ALL] !== 'undefined')
  {
    this.children[Subscriptions.TOKEN.ALL].sendMessage(
      EMPTY_TOPIC_PARTS, topic, message, meta
    );
  }

  if (topicParts.length === 0)
  {
    for (var i = 0, l = this.subscriptions.length; i < l; ++i)
    {
      this.subscriptions[i].send(topic, message, meta);
    }
  }
  else
  {
    var topicPart = topicParts.shift();

    if (typeof this.children[Subscriptions.TOKEN.ANY] !== 'undefined')
    {
      this.children[Subscriptions.TOKEN.ANY].sendMessage(
        [].concat(topicParts), topic, message, meta
      );
    }

    if (typeof this.children[topicPart] !== 'undefined')
    {
      this.children[topicPart].sendMessage(topicParts, topic, message, meta);
    }
  }

  --this.sendingMessagesCount;

  this.removePendingSubscriptions();
};

/**
 * @private
 * @param {string} topic
 * @returns {Array.<string>}
 * @throws {Error} If the specified topic is empty.
 */
Subscriptions.prototype.splitTopic = function(topic)
{
  var topicParts = topic
    .split(Subscriptions.TOKEN.SEPARATOR)
    .filter(function(part)
    {
      return part.length !== 0;
    });

  if (topicParts.length === 0)
  {
    throw new Error("Invalid subscription topic: " + topic);
  }

  return topicParts;
};

/**
 * @private
 * @param {h5.pubsub.Subscription} subscription
 */
Subscriptions.prototype.removeSubscription = function(subscription)
{
  this.messageBroker.emit('cancel', subscription);

  if (this.subscriptions.length === 0)
  {
    return;
  }

  if (this.subscriptions.length === 1 && this.subscriptions[0] === subscription)
  {
    this.subscriptions.length = 0;

    this.messageBroker.emit('empty topic', subscription.getTopic());

    return;
  }

  this.removeOrQueueRemoval(subscription);
};

/**
 * @private
 * @param {h5.pubsub.Subscription} subscription
 */
Subscriptions.prototype.removeOrQueueRemoval = function(subscription)
{
  if (this.sendingMessagesCount === 0)
  {
    this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);
  }
  else
  {
    this.subscriptionsPendingRemoval.push(subscription);
  }
};

/**
 * @private
 */
Subscriptions.prototype.removePendingSubscriptions = function()
{
  var subscriptionsPendingRemoval = this.subscriptionsPendingRemoval;
  var subscriptionsPendingRemovalCount = subscriptionsPendingRemoval.length;

  if (!subscriptionsPendingRemovalCount || this.sendingMessagesCount)
  {
    return;
  }

  var subscriptions = this.subscriptions;

  if (subscriptionsPendingRemovalCount === subscriptions.length)
  {
    subscriptionsPendingRemoval.length = 0;
    subscriptions.length = 0;

    return;
  }

  var indexesToRemove = [];
  var i;
  var l;

  for (i = 0; i < subscriptionsPendingRemovalCount; ++i)
  {
    indexesToRemove.push(subscriptions.indexOf(subscriptionsPendingRemoval[i]));
  }

  indexesToRemove.sort(function(a, b) { return b - a; });

  for (i = 0, l = indexesToRemove.length; i < l; ++i)
  {
    subscriptions.splice(indexesToRemove[i], 1);
  }

  subscriptionsPendingRemoval.length = 0;
};

});
