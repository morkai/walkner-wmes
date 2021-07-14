// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/broker',
  'app/pubsub',
  'app/user',
  'app/i18n',
  'app/wmes-osh-companies/CompanyCollection',
  'app/wmes-osh-divisions/DivisionCollection',
  'app/wmes-osh-workplaces/WorkplaceCollection',
  'app/wmes-osh-departments/DepartmentCollection',
  'app/wmes-osh-buildings/BuildingCollection',
  'app/wmes-osh-locations/LocationCollection',
  'app/wmes-osh-stations/StationCollection',
  'app/wmes-osh-kinds/KindCollection',
  'app/wmes-osh-activityKinds/ActivityKindCollection',
  'app/wmes-osh-observationKinds/ObservationKindCollection',
  'app/wmes-osh-observationCategories/ObservationCategoryCollection',
  'app/wmes-osh-eventCategories/EventCategoryCollection',
  'app/wmes-osh-reasonCategories/ReasonCategoryCollection',
  'app/wmes-osh-rootCauseCategories/RootCauseCategoryCollection',
  'app/wmes-osh-kaizenCategories/KaizenCategoryCollection',
  'app/wmes-osh-nearMisses/NearMiss',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-actions/Action',
  'app/wmes-osh-observations/Observation',
  './SettingCollection',
  'i18n!app/nls/wmes-osh-common'
], function(
  $,
  broker,
  pubsub,
  currentUser,
  t,
  CompanyCollection,
  DivisionCollection,
  WorkplaceCollection,
  DepartmentCollection,
  BuildingCollection,
  LocationCollection,
  StationCollection,
  KindCollection,
  ActivityKindCollection,
  ObservationKindCollection,
  ObservationCategoryCollection,
  EventCategoryCollection,
  ReasonCategoryCollection,
  RootCauseCategoryCollection,
  KaizenCategoryCollection,
  NearMiss,
  Kaizen,
  Action,
  Observation,
  SettingCollection
) {
  'use strict';

  const TOPIC_PREFIX = 'osh';
  const PROP_TO_DICT = {
    company: 'companies',
    division: 'divisions',
    workplace: 'workplaces',
    department: 'departments',
    building: 'buildings',
    location: 'locations',
    station: 'stations',
    kind: 'kinds',
    activityKind: 'activityKinds',
    observationKind: 'observationKinds',
    observationCategory: 'observationCategories',
    eventCategory: 'eventCategories',
    reasonCategory: 'reasonCategories',
    rootCauseCategory: 'rootCauseCategories',
    kaizenCategory: 'kaizenCategories'
  };
  const TYPE_TO_PREFIX = {
    nearMiss: 'Z',
    kaizen: 'K',
    action: 'A',
    observation: 'O',
    accident: 'W'
  };
  const PREFIX_TO_TYPE = {
    Z: 'nearMiss',
    K: 'kaizen',
    A: 'action',
    O: 'observation'
  };
  const TYPE_TO_MODULE = {
    nearMiss: 'nearMisses',
    kaizen: 'kaizens',
    action: 'actions',
    observation: 'observations'
  };
  const TYPE_TO_MODEL = {
    nearMiss: NearMiss,
    kaizen: Kaizen,
    action: Action,
    observation: Observation
  };
  const ORG_UNITS = [
    'division',
    'workplace',
    'department',
    'building',
    'location',
    'station'
  ];

  let req = null;
  let releaseTimer = null;
  let pubsubSandbox = null;
  let seenSub = null;
  let coordinator = null;
  const boundPages = new WeakSet();

  const dictionaries = {
    TYPE_TO_PREFIX,
    PREFIX_TO_TYPE,
    TYPE_TO_MODULE,
    TYPE_TO_MODEL,
    ORG_UNITS,
    statuses: {
      nearMiss: [],
      kaizen: [],
      actions: [],
      observations: []
    },
    priorities: [],
    kindTypes: [],
    entryTypes: Object.keys(TYPE_TO_PREFIX),
    settings: new SettingCollection(),
    companies: new CompanyCollection(),
    divisions: new DivisionCollection(),
    workplaces: new WorkplaceCollection(),
    departments: new DepartmentCollection(),
    buildings: new BuildingCollection(),
    locations: new LocationCollection(),
    stations: new StationCollection(),
    kinds: new KindCollection(),
    activityKinds: new ActivityKindCollection(),
    observationKinds: new ObservationKindCollection(),
    observationCategories: new ObservationCategoryCollection(),
    eventCategories: new EventCategoryCollection(),
    reasonCategories: new ReasonCategoryCollection(),
    rootCauseCategories: new RootCauseCategoryCollection(),
    kaizenCategories: new KaizenCategoryCollection(),
    currencyFormatter: new Intl.NumberFormat('pl', {
      style: 'currency',
      currency: 'PLN'
    }),
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
      if (id == null)
      {
        return '';
      }

      if (dictionary === 'priority')
      {
        return t('wmes-osh-common', `priority:${id}`);
      }

      if (dictionary === 'status')
      {
        return t('wmes-osh-common', `status:${id}`);
      }

      if (!id)
      {
        return '';
      }

      if (typeof dictionary === 'string')
      {
        dictionary = this.forProperty(dictionary) || dictionaries[dictionary];
      }

      if (!dictionary || Array.isArray(dictionary))
      {
        return String(id);
      }

      if (Array.isArray(id))
      {
        return id
          .map(id =>
          {
            const model = dictionary.get(id);

            if (!model)
            {
              return String(id);
            }

            return model.getLabel(options);
          })
          .join('; ');
      }

      const model = dictionary.get(id);

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

      if (Array.isArray(id))
      {
        return id
          .map(id =>
          {
            const model = dictionary.get(id);

            if (!model)
            {
              return '';
            }

            return model.get('description') || '';
          })
          .filter(description => !!description)
          .join('; ');
      }

      const model = dictionary.get(id);

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
      if (boundPages.has(page))
      {
        return page;
      }

      boundPages.add(page);

      page.on('beforeLoad', (page, requests) =>
      {
        requests.push({
          priority: true,
          promise: this.load()
        });
      });

      page.on('afterRender', () =>
      {
        this.load();
      });

      page.once('remove', () =>
      {
        this.unload();
        boundPages.delete(page);
      });

      return page;
    },
    isCoordinator: function()
    {
      if (coordinator === null)
      {
        coordinator = currentUser.isAllowedTo('OSH:COORDINATOR')
          || dictionaries.kinds.some(k => k.get('coordinators').some(u => u.id === currentUser.data._id))
          || dictionaries.departments.some(k => k.get('coordinators').some(u => u.id === currentUser.data._id));
      }

      return coordinator;
    }
  };

  broker.subscribe('user.reloaded', () => setUpSeenSub());

  dictionaries.kinds.on('reset change:coordinators', () => coordinator = null);
  dictionaries.departments.on('reset change:coordinators', () => coordinator = null);

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
      const dict = PROP_TO_DICT[prop];

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

  return window.oshDictionaries = dictionaries;
});
