// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/broker',
  'app/pubsub'
], function(
  time,
  broker,
  pubsub
) {
  'use strict';

  pubsub.subscribe('dictionaries.updated', function(message)
  {
    var topic = message.topic;
    var payload = message.message;
    var meta = message.meta;

    meta.remote = true;

    if (meta.json && typeof payload === 'string')
    {
      payload = JSON.parse(payload);
    }

    broker.publish(topic, payload, meta);
  });

  return function(storageKey, topicPrefix, Collection)
  {
    var remoteData = {
      time: time.appData,
      data: window[storageKey] || []
    };
    var localData = JSON.parse(localStorage.getItem(storageKey) || 'null');

    var freshestData = localData && localData.time > remoteData.time ? localData : remoteData;
    var collection = new Collection(freshestData.data);

    if (freshestData === remoteData)
    {
      storeLocally();
    }

    collection.on('add', storeLocally);
    collection.on('remove', storeLocally);
    collection.on('destroy', storeLocally);
    collection.on('change', storeLocally);
    collection.on('sync', storeLocally);

    broker.subscribe(topicPrefix + '.added', function(message)
    {
      collection.add(message.model);
    });

    broker.subscribe(topicPrefix + '.edited', function(message)
    {
      var model = collection.get(message.model._id);

      if (model)
      {
        model.set(message.model);
      }
      else
      {
        collection.add(message.model);
      }
    });

    broker.subscribe(topicPrefix + '.deleted', function(message)
    {
      collection.remove(message.model._id);
    });

    function storeLocally()
    {
      localStorage.setItem(storageKey, JSON.stringify({
        time: Date.now(),
        data: collection.models
      }));

      broker.publish(topicPrefix + '.synced');
    }

    return collection;
  };
});
