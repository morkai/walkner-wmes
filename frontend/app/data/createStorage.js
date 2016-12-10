// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/broker',
  'app/pubsub',
  './localStorage'
], function(
  time,
  broker,
  pubsub,
  localStorage
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
      data: window[storageKey] || null
    };
    var localData = JSON.parse(localStorage.getItem(storageKey) || '{"time":0,"data":null}');

    var freshestData = (localData && localData.time > remoteData.time) || !remoteData.data ? localData : remoteData;
    var collection = new Collection(freshestData.data);

    collection.updatedAt = freshestData.time;

    if (freshestData === remoteData || !localData.data)
    {
      storeLocally();
    }

    collection.on('add', storeLocally);
    collection.on('remove', storeLocally);
    collection.on('destroy', storeLocally);
    collection.on('change', storeLocally);
    collection.on('sync', storeLocally);
    collection.on('reset', storeLocally);

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
      collection.updatedAt = Date.now();

      localStorage.setItem(storageKey, JSON.stringify({
        time: collection.updatedAt,
        data: collection.models
      }));

      broker.publish(topicPrefix + '.synced');
    }

    return collection;
  };
});
