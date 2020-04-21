// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub'
], function(
  $,
  broker,
  pubsub
) {
  'use strict';

  var TOPIC_PREFIX = 'pfep.';
  var PROP_TO_DICT = {};

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    packTypes: [],
    units: [],
    vendors: [],
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
        url: '/pfep/dictionaries'
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

      pubsubSandbox.subscribe('pfep.entries.added', handleEntryMessage);
      pubsubSandbox.subscribe('pfep.entries.edited', handleEntryMessage);

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

    dictionaries.packTypes = data ? data.packTypes : [];
    dictionaries.units = data ? data.units : [];
    dictionaries.vendors = data ? data.vendors : [];
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

  function handleEntryMessage(message)
  {
    var entry = message.model;
    var maps = {
      packTypes: {},
      units: {},
      vendors: {}
    };

    Object.keys(maps).forEach(function(k)
    {
      dictionaries[k].forEach(function(v)
      {
        maps[k][prep(v)] = true;
      });
    });

    if (!maps.packTypes[prep(entry.packType)])
    {
      dictionaries.packTypes.push(entry.packType).sort();
      dictionaries.packTypes.sort();

      broker.publish('pfep.dictionaries.updated', {dictionary: 'packTypes'});
    }

    if (!maps.units[prep(entry.unit)])
    {
      dictionaries.units.push(entry.unit).sort();
      dictionaries.units.sort();

      broker.publish('pfep.dictionaries.updated', {dictionary: 'units'});
    }

    if (!maps.vendors[prep(entry.vendor)])
    {
      dictionaries.vendors.push(entry.vendor);
      dictionaries.vendors.sort();

      broker.publish('pfep.dictionaries.updated', {dictionary: 'vendors'});
    }

    function prep(v)
    {
      return v.replace(/[^A-Za-z0-9]+/g, '');
    }
  }

  return dictionaries;
});
