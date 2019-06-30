// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
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
  '../qiStandards/QiStandardCollection',
  '../qiActionStatuses/QiActionStatusCollection'
], function(
  _,
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
  QiStandardCollection,
  QiActionStatusCollection
) {
  'use strict';

  var DICTS = [
    'kinds',
    'errorCategories',
    'faults',
    'standards',
    'actionStatuses'
  ];
  var PROP_TO_DICT = {
    kind: 'kinds',
    errorCategory: 'errorCategories',
    faultCode: 'faults',
    standard: 'standards',
    actionStatus: 'actionStatuses'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var brokerSandbox = null;
  var settings = createSettings(QiSettingCollection);
  var dictionaries = {
    inspectors: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login,active)&privileges=QI%3AINSPECTOR'
    }),
    masters: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login,active)&prodFunction=master'
    }),
    leaders: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login,active)&prodFunction=in=(leader,prod_whman)'
    }),
    whman: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login,active)&prodFunction=regex=whman'
    }),
    productFamilies: [],
    settings: settings.acquire(),
    counter: {
      actual: 0,
      required: 0
    },
    kinds: new QiKindCollection(),
    errorCategories: new QiErrorCategoryCollection(),
    faults: new QiFaultCollection(),
    standards: new QiStandardCollection(),
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

      reloadDictionaries();

      brokerSandbox = broker.sandbox();
      brokerSandbox.subscribe('socket.connected', reloadDictionaries);
      brokerSandbox.subscribe('viewport.page.shown', renderCounter);

      pubsubSandbox = pubsub.sandbox();

      DICTS.forEach(function(dict)
      {
        pubsubSandbox.subscribe('qi.' + dict + '.**', handleDictionaryMessage);
      });

      pubsubSandbox.subscribe('users.*', reloadUsers);
      pubsubSandbox.subscribe('qi.counter.recounted', updateCounter);

      dictionaries.settings.on('change', updateRequiredCount);

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
    DICTS.forEach(function(prop)
    {
      dictionaries[prop].reset(data ? data[prop] : []);
    });

    dictionaries.settings.reset(data ? data.settings : []);
    dictionaries.inspectors.reset(data ? data.inspectors : []);
    dictionaries.masters.reset(data ? data.masters : []);
    dictionaries.leaders.reset(data ? data.leaders : []);
    dictionaries.whman.reset(data ? data.whman : []);
    dictionaries.productFamilies = data ? data.productFamilies : [];

    dictionaries.counter = data && data.counter || {
      actual: 0,
      required: 0
    };

    renderCounter();
  }

  function updateRequiredCount(model)
  {
    if (model.id === 'qi.requiredCount')
    {
      dictionaries.counter.required = dictionaries.settings.getValue('requiredCount') || 0;

      renderCounter();
    }
  }

  function updateCounter(message)
  {
    if (message.user === user.data._id)
    {
      dictionaries.counter.actual = message.count;

      renderCounter();
    }
  }

  function renderCounter()
  {
    var $counter = $('.qi-counter');

    if (!$counter.length)
    {
      return;
    }

    var counter = dictionaries.counter;

    $counter
      .toggleClass('success', counter.actual >= counter.required)
      .toggleClass('hidden', !counter.required || !_.includes(user.data.privileges, 'QI:INSPECTOR'));

    $counter.find('.qi-counter-actual').text(counter.actual);

    $counter.find('.qi-counter-required').text(counter.required);
  }

  function unload()
  {
    releaseTimer = null;

    if (brokerSandbox !== null)
    {
      brokerSandbox.destroy();
      brokerSandbox = null;
    }

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

  function reloadUsers()
  {
    dictionaries.inspectors.fetch();
    dictionaries.masters.fetch();
    dictionaries.leaders.fetch();
    dictionaries.whman.fetch();
  }

  function reloadDictionaries()
  {
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
  }

  return dictionaries;
});
