// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../kaizenSections/KaizenSectionCollection',
  '../kaizenAreas/KaizenAreaCollection',
  '../kaizenCategories/KaizenCategoryCollection',
  '../kaizenCauses/KaizenCauseCollection',
  '../kaizenRisks/KaizenRiskCollection',
  '../kaizenBehaviours/KaizenBehaviourCollection',
  '../kaizenProductFamilies/KaizenProductFamilyCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  KaizenSectionCollection,
  KaizenAreaCollection,
  KaizenCategoryCollection,
  KaizenCauseCollection,
  KaizenRiskCollection,
  KaizenBehaviourCollection,
  KaizenProductFamilyCollection
) {
  'use strict';

  var PROP_TO_DICT = {
    section: 'sections',
    area: 'areas',
    nearMissCategory: 'categories',
    suggestionCategory: 'categories',
    category: 'categories',
    cause: 'causes',
    risk: 'risks',
    productFamily: 'productFamilies'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var kaizenSeenSub = null;
  var suggestionSeenSub = null;
  var dictionaries = {
    multiType: !!window.KAIZEN_MULTI,
    types: [],
    statuses: [],
    sections: new KaizenSectionCollection(),
    areas: new KaizenAreaCollection(),
    categories: new KaizenCategoryCollection(),
    causes: new KaizenCauseCollection(),
    risks: new KaizenRiskCollection(),
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

        dictionaries.types = res.types;
        dictionaries.statuses = res.statuses;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(function()
      {
        req = null;
      });

      pubsubSandbox = pubsub.sandbox();
      pubsubSandbox.subscribe('kaizen.sections.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('kaizen.areas.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('kaizen.categories.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('kaizen.causes.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('kaizen.risks.**', handleDictionaryMessage);
      pubsubSandbox.subscribe('kaizen.productFamilies.**', handleDictionaryMessage);

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
    [
      'sections',
      'areas',
      'categories',
      'causes',
      'risks',
      'productFamilies'
    ].forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });
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
