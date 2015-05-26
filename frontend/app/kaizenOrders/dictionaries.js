// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../kaizenSections/KaizenSectionCollection',
  '../kaizenAreas/KaizenAreaCollection',
  '../kaizenCategories/KaizenCategoryCollection',
  '../kaizenCauses/KaizenCauseCollection',
  '../kaizenRisks/KaizenRiskCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  KaizenSectionCollection,
  KaizenAreaCollection,
  KaizenCategoryCollection,
  KaizenCauseCollection,
  KaizenRiskCollection
) {
  'use strict';

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var seenSub = null;
  var dictionaries = {
    types: [],
    statuses: [],
    sections: new KaizenSectionCollection(),
    areas: new KaizenAreaCollection(),
    categories: new KaizenCategoryCollection(),
    causes: new KaizenCauseCollection(),
    risks: new KaizenRiskCollection(),
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
        dictionaries.sections.reset(res.sections);
        dictionaries.areas.reset(res.areas);
        dictionaries.categories.reset(res.categories);
        dictionaries.causes.reset(res.causes);
        dictionaries.risks.reset(res.risks);
      });

      req.fail(unload);

      req.always(function()
      {
        req = null;
      });

      pubsubSandbox = pubsub.sandbox();
      pubsubSandbox.subscribe('kaizen.sections.**', handleKaizenMessage);
      pubsubSandbox.subscribe('kaizen.areas.**', handleKaizenMessage);
      pubsubSandbox.subscribe('kaizen.categories.**', handleKaizenMessage);
      pubsubSandbox.subscribe('kaizen.causes.**', handleKaizenMessage);
      pubsubSandbox.subscribe('kaizen.risks.**', handleKaizenMessage);

      seenSub = pubsubSandbox.subscribe('kaizen.orders.seen.' + user.data._id, handleSeenMessage);

      return req;
    },
    unload: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
      }

      releaseTimer = setTimeout(unload, 30000);
    }
  };

  broker.subscribe('user.reloaded', function()
  {
    if (seenSub)
    {
      seenSub.cancel();
      seenSub = null;
    }

    if (pubsubSandbox)
    {
      seenSub = pubsubSandbox.subscribe('kaizen.orders.seen.' + user.data._id, handleSeenMessage);
    }
  });

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
    dictionaries.types = [];
    dictionaries.statuses = [];
    dictionaries.sections.reset();
    dictionaries.areas.reset();
    dictionaries.categories.reset();
    dictionaries.causes.reset();
    dictionaries.risks.reset();
  }

  function handleKaizenMessage(message, topic)
  {
    var topicParts = topic.split('.');
    var collection = dictionaries[topicParts[1]];

    if (!collection)
    {
      return;
    }

    switch (topicParts[1])
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
    broker.publish('kaizen.orders.seen', message.orderId);
  }

  return dictionaries;
});
