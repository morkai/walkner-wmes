// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'utf8',
  'h5.pubsub/MessageBroker',
  'app/broker',
  'app/socket'
],
function(
  _,
  utf8,
  MessageBroker,
  broker,
  socket
) {
  'use strict';

  var pubsub = new MessageBroker();

  var pendingUnsubscriptions = {};
  var pendingSubscriptions = [];
  var subscribeTimer = null;
  var unsubscribeTimer = null;

  pubsub.on('new topic', function(topic)
  {
    if (typeof pendingUnsubscriptions[topic] !== 'undefined')
    {
      delete pendingUnsubscriptions[topic];
    }

    if (socket.isConnected())
    {
      pendingSubscriptions.push(topic);

      if (subscribeTimer === null)
      {
        subscribeTimer = setTimeout(sendPendingSubscriptions, 0);
      }
    }
  });

  pubsub.on('empty topic', function(topic)
  {
    if (socket.isConnected())
    {
      pendingUnsubscriptions[topic] = true;

      if (unsubscribeTimer === null)
      {
        unsubscribeTimer = setTimeout(sendPendingUnsubscriptions, 0);
      }
    }
  });

  pubsub.on('message', function(topic, message, meta)
  {
    if (meta.remote === true)
    {
      return;
    }

    socket.emit('pubsub.publish', topic, message, meta, function(err)
    {
      if (err)
      {
        broker.publish('pubsub.publishFailed', {
          err: err,
          topic: topic,
          message: message,
          meta: meta
        });
      }
      else
      {
        broker.publish('pubsub.published', {
          topic: topic,
          message: message,
          meta: meta
        });
      }
    });
  });

  socket.on('connect', function()
  {
    var topics = Object.keys(pubsub.count());

    if (topics.length)
    {
      socket.emit('pubsub.subscribe', topics, onSocketSubscribe.bind(null, topics));
    }
  });

  socket.on('pubsub.message', function(message)
  {
    try
    {
      if (message instanceof ArrayBuffer)
      {
        message = utf8.decode(String.fromCharCode.apply(null, new Uint8Array(message)));
      }

      if (typeof message === 'string')
      {
        message = JSON.parse(message);
      }

      message[2].remote = true;
    }
    catch (err)
    {
      return console.error('[pubsub] Failed to parse remote message:', {
        message: message
      });
    }

    pubsub.publish(message[0], message[1], message[2]);
  });

  function onSocketSubscribe(topics, err, notAllowedTopics)
  {
    if (err)
    {
      broker.publish('pubsub.subscribeFailed', {
        err: err,
        topics: topics
      });

      return;
    }

    if (notAllowedTopics.length > 0)
    {
      broker.publish('pubsub.subscribeNotAllowed', {
        topics: notAllowedTopics
      });
    }

    var subscribedTopics = _.difference(topics, notAllowedTopics);

    if (subscribedTopics.length > 0)
    {
      broker.publish('pubsub.subscribed', {
        topics: subscribedTopics
      });
    }
  }

  function sendPendingSubscriptions()
  {
    if (socket.isConnected())
    {
      socket.emit(
        'pubsub.subscribe',
        pendingSubscriptions,
        onSocketSubscribe.bind(null, pendingSubscriptions)
      );
    }

    pendingSubscriptions = [];
    subscribeTimer = null;
  }

  function sendPendingUnsubscriptions()
  {
    var topics = Object.keys(pendingUnsubscriptions);

    if (socket.isConnected())
    {
      socket.emit('pubsub.unsubscribe', topics);
    }

    pendingUnsubscriptions = {};
    unsubscribeTimer = null;

    broker.publish('pubsub.unsubscribed', {topics: topics});
  }

  window.pubsub = pubsub;

  return pubsub;
});
