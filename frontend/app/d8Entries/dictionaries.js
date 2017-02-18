// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../d8Areas/D8AreaCollection',
  '../d8EntrySources/D8EntrySourceCollection',
  '../d8ProblemSources/D8ProblemSourceCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  D8AreaCollection,
  D8EntrySourceCollection,
  D8ProblemSourceCollection
) {
  'use strict';

  var PROP_TO_DICT = {
    area: 'areas',
    entrySource: 'entrySources',
    problemSource: 'problemSources'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var seenSub = null;
  var dictionaries = {
    statuses: [],
    areas: new D8AreaCollection(),
    entrySources: new D8EntrySourceCollection(),
    problemSources: new D8ProblemSourceCollection(),
    loaded: false,
    load: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }

      if (dictionaries.loaded)
      {
        return null;
      }

      if (req !== null)
      {
        return req;
      }

      req = $.ajax({
        url: '/d8/dictionaries'
      });

      req.done(function(res)
      {
        dictionaries.loaded = true;
        dictionaries.statuses = res.statuses;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(function()
      {
        req = null;
      });

      pubsubSandbox = pubsub.sandbox();
      pubsubSandbox.subscribe('d8.areas.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('d8.entrySources.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('d8.problemSources.**', handleDictionaryMessage);

      subToSeenMessage();

      return req;
    },
    unload: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
      }

      releaseTimer = setTimeout(unload, 30000);
    },
    getLabel: function(dictionary, id)
    {
      if (typeof dictionary === 'string')
      {
        dictionary = this.forProperty(dictionary) || dictionaries[dictionary];
      }

      if (!dictionary || Array.isArray(dictionary))
      {
        return id;
      }

      var model = dictionary.get(id);

      if (!model)
      {
        return id;
      }

      return model.getLabel();
    },
    forProperty: function(prop)
    {
      return this[PROP_TO_DICT[prop]] || null;
    }
  };

  broker.subscribe('user.reloaded', function()
  {
    if (seenSub)
    {
      seenSub.cancel();
      seenSub = null;
    }

    subToSeenMessage();
  });

  function resetDictionaries(data)
  {
    [
      'areas',
      'entrySources',
      'problemSources'
    ].forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });
  }

  function subToSeenMessage()
  {
    if (pubsubSandbox)
    {
      seenSub = pubsubSandbox.subscribe('d8.entries.seen.' + user.data._id, handleSeenMessage);
    }
  }

  function unload()
  {
    releaseTimer = null;

    if (pubsubSandbox !== null)
    {
      pubsubSandbox.destroy();
      pubsubSandbox = null;
      seenSub = null;
    }

    dictionaries.loaded = false;
    dictionaries.statuses = [];

    resetDictionaries();
  }

  function handleDictionaryMessage(message, topic)
  {
    var topicParts = topic.split('.');
    var collection = dictionaries[topicParts[1]];

    if (!collection)
    {
      return;
    }

    switch (topicParts[2])
    {
      case 'added':
        collection.add(message.model);
        break;

      case 'edited':
      {
        var editedModel = collection.get(message.model._id);

        if (editedModel)
        {
          editedModel.set(message.model);
        }
        break;
      }

      case 'deleted':
        collection.remove(collection.get(message.model._id));
        break;
    }

    broker.publish(topic, message);
  }

  function handleSeenMessage(message)
  {
    broker.publish('d8.entries.seen', message.entryId);
  }

  return dictionaries;
});
