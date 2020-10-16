// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/broker',
  'app/pubsub',
  'app/user',
  'app/i18n',
  'app/wmes-osh-workplaces/WorkplaceCollection',
  'app/wmes-osh-divisions/DivisionCollection',
  'app/wmes-osh-buildings/BuildingCollection',
  'app/wmes-osh-locations/LocationCollection',
  'app/wmes-osh-kinds/KindCollection',
  'app/wmes-osh-eventCategories/EventCategoryCollection',
  'app/wmes-osh-reasonCategories/ReasonCategoryCollection',
  './SettingCollection'
], function(
  $,
  broker,
  pubsub,
  currentUser,
  t,
  WorkplaceCollection,
  DivisionCollection,
  BuildingCollection,
  LocationCollection,
  KindCollection,
  EventCategoryCollection,
  ReasonCategoryCollection,
  SettingCollection
) {
  'use strict';

  const TOPIC_PREFIX = 'osh';
  const PROP_TO_DICT = {
    workplace: 'workplaces',
    division: 'divisions',
    building: 'buildings',
    location: 'locations',
    kind: 'kinds',
    eventCategory: 'eventCategories',
    reasonCategory: 'reasonCategories'
  };

  let req = null;
  let releaseTimer = null;
  let pubsubSandbox = null;
  let seenSub = null;

  const dictionaries = {
    statuses: {
      nearMiss: []
    },
    priorities: [],
    kindTypes: [],
    settings: new SettingCollection(),
    workplaces: new WorkplaceCollection(),
    divisions: new DivisionCollection(),
    buildings: new BuildingCollection(),
    locations: new LocationCollection(),
    kinds: new KindCollection(),
    eventCategories: new EventCategoryCollection(),
    reasonCategories: new ReasonCategoryCollection(),
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
        url: '/osh/dictionaries'
      });

      req.done(res =>
      {
        dictionaries.loaded = true;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(() => req = null);

      pubsubSandbox = pubsub.sandbox();

      Object.keys(PROP_TO_DICT).forEach(prop =>
      {
        pubsubSandbox.subscribe(`${TOPIC_PREFIX}.${PROP_TO_DICT[prop]}.**`, handleDictionaryMessage);
      });

      dictionaries.settings.setUpPubsub(pubsubSandbox);

      setUpSeenSub();

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
    getLabel: function(dictionary, id, options)
    {
      if (dictionary === 'priority')
      {
        return t('wmes-osh-common', `priority:${id}`);
      }

      if (dictionary === 'status')
      {
        return t('wmes-osh-common', `status:${id}`);
      }

      if (typeof dictionary === 'string')
      {
        dictionary = this.forProperty(dictionary) || dictionaries[dictionary];
      }

      if (!dictionary || Array.isArray(dictionary))
      {
        return String(id);
      }

      var model = dictionary.get(id);

      if (!model)
      {
        return String(id);
      }

      return model.getLabel(options);
    },
    getDescription: function(dictionary, id)
    {
      if (typeof dictionary === 'string')
      {
        dictionary = this.forProperty(dictionary) || dictionaries[dictionary];
      }

      if (!dictionary || Array.isArray(dictionary))
      {
        return '';
      }

      var model = dictionary.get(id);

      if (!model)
      {
        return '';
      }

      return model.get('description') || '';
    },
    forProperty: function(prop)
    {
      return this[PROP_TO_DICT[prop]] || null;
    },
    bind: function(page)
    {
      var dictionaries = this;

      page.on('beforeLoad', (page, requests) =>
      {
        requests.push(dictionaries.load());
      });

      page.on('afterRender', dictionaries.load.bind(dictionaries));

      page.once('remove', dictionaries.unload.bind(dictionaries));

      return page;
    }
  };

  broker.subscribe('user.reloaded', () => setUpSeenSub());

  function setUpSeenSub()
  {
    if (seenSub)
    {
      seenSub.cancel();
      seenSub = null;
    }

    if (pubsubSandbox && currentUser.isLoggedIn())
    {
      seenSub = pubsubSandbox.subscribe(
        `${TOPIC_PREFIX}.*.seen.${currentUser.data._id}`,
        (message, topic) => broker.publish(topic, message)
      );
    }
  }

  function resetDictionaries(data)
  {
    if (data)
    {
      ['statuses', 'priorities', 'kindTypes'].forEach(prop =>
      {
        if (data[prop])
        {
          dictionaries[prop] = data[prop];
        }
      });
    }

    Object.keys(PROP_TO_DICT).forEach(prop =>
    {
      var dict = PROP_TO_DICT[prop];

      if (Array.isArray(dictionaries[dict]))
      {
        dictionaries[dict] = data ? data[dict] : [];
      }
      else if (dictionaries[dict] && dictionaries[dict].reset)
      {
        dictionaries[dict].reset(data ? data[dict] : []);
      }
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
      seenSub = null;
    }

    dictionaries.loaded = false;

    resetDictionaries();
  }

  function handleDictionaryMessage(message, topic)
  {
    const topicParts = topic.split('.');
    const collection = dictionaries[topicParts[1]];

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
        const editedModel = collection.get(message.model._id);

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
