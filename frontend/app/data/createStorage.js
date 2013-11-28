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

  return function(storageKey, topicPrefix, Collection)
  {
    var remoteData = window[storageKey] || [];
    var localData = JSON.parse(localStorage.getItem(storageKey) || 'null');

    if (!localData || navigator.onLine)
    {
      localData = {
        time: time.appData,
        data: remoteData
      };

      localStorage.setItem(storageKey, JSON.stringify(localData));
    }

    var freshestData = localData.time > remoteData.time ? localData : remoteData;
    var collection = new Collection(freshestData);

    collection.on('add', storeLocally);
    collection.on('remove', storeLocally);
    collection.on('destroy', storeLocally);
    collection.on('change', storeLocally);
    collection.on('sync', storeLocally);

    pubsub.subscribe(topicPrefix + '.added', function(message)
    {
      collection.add(message.model);
    });

    pubsub.subscribe(topicPrefix + '.edited', function(message)
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

    pubsub.subscribe(topicPrefix + '.deleted', function(message)
    {
      collection.remove(message.model._id);
    });

    function storeLocally()
    {
      localStorage.setItem(storageKey, JSON.stringify({
        time: Date.now(),
        data: collection.attributes
      }));

      broker.publish(topicPrefix + '.synced');
    }

    return collection;
  };
});
