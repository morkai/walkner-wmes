// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../users/UserCollection',
  '../data/createSettings',
  './QiSettingCollection',
  '../qiKinds/QiKindCollection',
  '../qiErrorCategories/QiErrorCategoryCollection',
  '../qiFaults/QiFaultCollection',
  '../qiActionStatuses/QiActionStatusCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  UserCollection,
  createSettings,
  QiSettingCollection,
  QiKindCollection,
  QiErrorCategoryCollection,
  QiFaultCollection,
  QiActionStatusCollection
) {
  'use strict';

  var DICTS = [
    'kinds',
    'errorCategories',
    'faults',
    'actionStatuses'
  ];
  var PROP_TO_DICT = {
    kind: 'kinds',
    errorCategory: 'errorCategories',
    fault: 'faults',
    actionStatus: 'actionStatuses'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var settings = createSettings(QiSettingCollection);
  var dictionaries = {
    inspectors: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login)&privileges=QI%3AINSPECTOR'
    }),
    productFamilies: [],
    settings: settings.acquire(),
    kinds: new QiKindCollection(),
    errorCategories: new QiErrorCategoryCollection(),
    faults: new QiFaultCollection(),
    actionStatuses: new QiActionStatusCollection(),
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
        url: '/qi/dictionaries'
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
        pubsubSandbox.subscribe('qi.' + dict + '.**', handleDictionaryMessage);
      });

      pubsubSandbox.subscribe('users.*', reloadInspectors);

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
    DICTS.forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });

    dictionaries.settings.reset(data ? data.settings : []);
    dictionaries.inspectors.reset(data ? data.inspectors : []);
    dictionaries.productFamilies = data ? data.productFamilies : [];
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

  function reloadInspectors()
  {
    dictionaries.inspectors.fetch();
  }

  return dictionaries;
});
