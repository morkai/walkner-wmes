// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../wmes-trw-testers/TesterCollection',
  '../wmes-trw-bases/BaseCollection',
  '../wmes-trw-programs/ProgramCollection'
], function(
  $,
  broker,
  pubsub,
  TesterCollection,
  BaseCollection,
  ProgramCollection
) {
  'use strict';

  var TOPIC_PREFIX = 'trw.';
  var PROP_TO_DICT = {
    tester: 'testers',
    bases: 'bases',
    program: 'programs'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    testers: new TesterCollection(),
    bases: new BaseCollection(),
    programs: new ProgramCollection(),
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
        url: '/trw/dictionaries'
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

      Object.keys(PROP_TO_DICT).forEach(function(prop)
      {
        pubsubSandbox.subscribe(TOPIC_PREFIX + PROP_TO_DICT[prop] + '.**', handleDictionaryMessage);
      });

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
    },
    bind: function(page)
    {
      var dictionaries = this;

      page.on('beforeLoad', function(page, requests)
      {
        requests.push(dictionaries.load());
      });

      page.on('afterRender', dictionaries.load.bind(dictionaries));

      page.once('remove', dictionaries.unload.bind(dictionaries));

      return page;
    }
  };

  function resetDictionaries(data)
  {
    if (data && data.types)
    {
      dictionaries.types = data.types;
    }

    Object.keys(PROP_TO_DICT).forEach(function(prop)
    {
      var dict = PROP_TO_DICT[prop];

      dictionaries[dict].reset(data ? data[dict] : []);
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
