// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../wmes-fap-categories/CategoryCollection',
  '../wmes-fap-subCategories/SubCategoryCollection',
  './SettingCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  CategoryCollection,
  SubCategoryCollection,
  SettingCollection
) {
  'use strict';

  var TOPIC_PREFIX = 'fap.';
  var PROP_TO_DICT = {
    category: 'categories',
    subCategory: 'subCategories'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    statuses: ['pending', 'started', 'finished'],
    subdivisionTypes: ['assembly', 'press', 'wh'],
    reqFields: ['orderNo', 'lines', 'componentCode'],
    categories: new CategoryCollection(),
    subCategories: new SubCategoryCollection(),
    settings: new SettingCollection(),
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
        return $.Deferred().resolve();
      }

      if (req !== null)
      {
        return req;
      }

      req = $.ajax({
        url: '/fap/dictionaries'
      });

      req.done(function(res)
      {
        dictionaries.loaded = true;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(function() { req = null; });

      pubsubSandbox = pubsub.sandbox();

      Object.keys(PROP_TO_DICT).forEach(function(prop)
      {
        pubsubSandbox.subscribe(TOPIC_PREFIX + PROP_TO_DICT[prop] + '.**', handleDictionaryMessage);
      });

      dictionaries.settings.setUpPubsub(pubsubSandbox);

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
    Object.keys(PROP_TO_DICT).forEach(function(prop)
    {
      var dict = PROP_TO_DICT[prop];

      dictionaries[dict].reset(data ? data[dict] : []);
    });

    dictionaries.settings.reset(data ? data.settings : []);
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
