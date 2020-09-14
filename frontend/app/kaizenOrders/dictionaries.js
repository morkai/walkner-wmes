// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../data/createSettings',
  '../kaizenSections/KaizenSectionCollection',
  '../kaizenAreas/KaizenAreaCollection',
  '../kaizenCategories/KaizenCategoryCollection',
  '../kaizenCauses/KaizenCauseCollection',
  '../kaizenRisks/KaizenRiskCollection',
  '../kaizenBehaviours/KaizenBehaviourCollection',
  '../kaizenProductFamilies/KaizenProductFamilyCollection',
  './KaizenSettingCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  createSettings,
  KaizenSectionCollection,
  KaizenAreaCollection,
  KaizenCategoryCollection,
  KaizenCauseCollection,
  KaizenRiskCollection,
  KaizenBehaviourCollection,
  KaizenProductFamilyCollection,
  KaizenSettingCollection
) {
  'use strict';

  var DICTS = [
    'sections',
    'areas',
    'categories',
    'causes',
    'risks',
    'productFamilies',
    'behaviours'
  ];
  var PROP_TO_DICT = {
    section: 'sections',
    area: 'areas',
    nearMissCategory: 'categories',
    suggestionCategory: 'categories',
    category: 'categories',
    cause: 'causes',
    risk: 'risks',
    behaviour: 'behaviours',
    productFamily: 'productFamilies'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var kaizenSeenSub = null;
  var suggestionSeenSub = null;
  var settings = createSettings(KaizenSettingCollection);
  var dictionaries = {
    multiType: !!window.KAIZEN_MULTI,
    colors: {
      nearMiss: '#d9534f',
      suggestion: '#f0ad4e',
      kaizen: '#5cb85c',
      observation: '#31b0d5',
      minutes: '#5cb85c'
    },
    settings: settings.acquire(),
    types: [],
    nmStatuses: [],
    kzStatuses: [],
    sections: new KaizenSectionCollection(),
    areas: new KaizenAreaCollection(),
    categories: new KaizenCategoryCollection(),
    causes: new KaizenCauseCollection(),
    risks: new KaizenRiskCollection(),
    behaviours: new KaizenBehaviourCollection(),
    productFamilies: new KaizenProductFamilyCollection(),
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
        url: '/kaizen/dictionaries'
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

      DICTS.forEach(function(dict)
      {
        pubsubSandbox.subscribe('kaizen.' + dict + '.**', handleDictionaryMessage);
      });

      subToSeenMessages();

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

  broker.subscribe('user.reloaded', function()
  {
    if (kaizenSeenSub)
    {
      kaizenSeenSub.cancel();
      kaizenSeenSub = null;
    }

    if (suggestionSeenSub)
    {
      suggestionSeenSub.cancel();
      suggestionSeenSub = null;
    }

    subToSeenMessages();
  });

  function resetDictionaries(data)
  {
    DICTS.forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });

    dictionaries.types = data ? data.types : [];
    dictionaries.nmStatuses = data ? data.nmStatuses : [];
    dictionaries.kzStatuses = data ? data.kzStatuses : [];

    dictionaries.settings.reset(data ? data.settings : []);
  }

  function subToSeenMessages()
  {
    if (pubsubSandbox)
    {
      kaizenSeenSub = pubsubSandbox.subscribe('kaizen.orders.seen.' + user.data._id, handleKaizenSeenMessage);
      suggestionSeenSub = pubsubSandbox.subscribe('suggestions.seen.' + user.data._id, handleSuggestionSeenMessage);
    }
  }

  function unload()
  {
    releaseTimer = null;

    if (pubsubSandbox !== null)
    {
      pubsubSandbox.destroy();
      pubsubSandbox = null;
      kaizenSeenSub = null;
      suggestionSeenSub = null;
    }

    dictionaries.loaded = false;
    dictionaries.types = [];
    dictionaries.nmStatuses = [];
    dictionaries.kzStatuses = [];

    resetDictionaries();

    settings.release();
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

  function handleKaizenSeenMessage(message)
  {
    broker.publish('kaizen.orders.seen', message.orderId);
  }

  function handleSuggestionSeenMessage(message)
  {
    broker.publish('suggestions.seen', message.orderId);
  }

  return dictionaries;
});
