// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../data/createSettings',
  '../data/companies',
  '../kaizenSections/KaizenSectionCollection',
  '../kaizenAreas/KaizenAreaCollection',
  '../kaizenCategories/KaizenCategoryCollection',
  '../kaizenCauses/KaizenCauseCollection',
  '../kaizenRisks/KaizenRiskCollection',
  '../kaizenBehaviours/KaizenBehaviourCollection',
  '../kaizenProductFamilies/KaizenProductFamilyCollection',
  '../kaizenTopics/KaizenTopicCollection',
  '../kaizenControlLists/KaizenControlListCollection',
  '../kaizenControlCategories/KaizenControlCategoryCollection',
  './KaizenSettingCollection'
], function(
  $,
  broker,
  pubsub,
  currentUser,
  createSettings,
  companies,
  KaizenSectionCollection,
  KaizenAreaCollection,
  KaizenCategoryCollection,
  KaizenCauseCollection,
  KaizenRiskCollection,
  KaizenBehaviourCollection,
  KaizenProductFamilyCollection,
  KaizenTopicCollection,
  KaizenControlListCollection,
  KaizenControlCategoryCollection,
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
    'behaviours',
    'topics',
    'controlLists',
    'controlCategories'
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
    productFamily: 'productFamilies',
    company: 'companies',
    topic: 'topics',
    controlList: 'controlLists',
    controlCategory: 'controlCategories'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var kaizenSeenSub = null;
  var suggestionSeenSub = null;
  var auditor = null;
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
    topics: new KaizenTopicCollection(),
    controlLists: new KaizenControlListCollection(),
    controlCategories: new KaizenControlCategoryCollection(),
    companies: companies,
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
        dictionary = this.forProperty(dictionary);
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
      return this[PROP_TO_DICT[prop]] || this[prop] || null;
    },
    bind: function(page)
    {
      var dictionaries = this;

      if (page.__kaizenDictionariesBound__)
      {
        return page;
      }

      page.__kaizenDictionariesBound__ = true;

      page.on('beforeLoad', function(page, requests)
      {
        requests.push({
          priority: true,
          promise: dictionaries.load()
        });
      });

      page.on('afterRender', function()
      {
        dictionaries.load();
      });

      page.once('remove', function()
      {
        dictionaries.unload();

        page.__kaizenDictionariesBound__ = false;
      });

      return page;
    },
    isAuditor: function()
    {
      if (auditor === null)
      {
        auditor = currentUser.isAllowedTo('OSH_AUDITS:AUDITOR')
          || dictionaries.sections.some(k => k.get('auditors').some(u => u.id === currentUser.data._id));
      }

      return auditor;
    }
  };

  broker.subscribe('socket.connected', function()
  {
    if (dictionaries.loaded)
    {
      dictionaries.loaded = false;
      dictionaries.load();
    }
  });

  broker.subscribe('user.reloaded', function()
  {
    subToSeenMessages();
  });

  dictionaries.sections.on('reset change:auditors', function()
  {
    auditor = null;
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

    if (pubsubSandbox)
    {
      kaizenSeenSub = pubsubSandbox.subscribe('kaizen.orders.seen.' + currentUser.data._id, handleKaizenSeenMessage);
      suggestionSeenSub = pubsubSandbox.subscribe('suggestions.seen.' + currentUser.data._id, handleSuggestionSeenMessage);
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
