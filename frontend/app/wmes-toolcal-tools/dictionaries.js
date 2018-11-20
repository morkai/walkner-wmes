// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../wmes-toolcal-types/TypeCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  TypeCollection
) {
  'use strict';

  var PROP_TO_DICT = {
    type: 'types'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    statuses: ['in-use', 'retired'],
    types: new TypeCollection(),
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
        url: '/toolcal/dictionaries'
      });

      req.done(function(res)
      {
        dictionaries.loaded = true;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(function()
      {
        req = null;
      });

      pubsubSandbox = pubsub.sandbox();
      pubsubSandbox.subscribe('toolcal.types.**', handleDictionaryMessage);

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

  function resetDictionaries(data)
  {
    [
      'types'
    ].forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });
  }

  function unload()
  {
    releaseTimer = null;

    if (pubsubSandbox !== null)
    {
      pubsubSandbox.destroy();
      pubsubSandbox = null;
    }

    dictionaries.loaded = false;

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

  return dictionaries;
});
