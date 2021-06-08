// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../core/Model',
  '../core/Collection',
  'app/kanbanSupplyAreas/KanbanSupplyAreaCollection',
  'app/kanbanContainers/KanbanContainerCollection',
  'app/kanbanComponents/KanbanComponentCollection',
  './KanbanSettingCollection',
  './KanbanTableView',
  './KanbanEntryCollection',
  './KanbanPrintQueueBuilder'
], function(
  $,
  broker,
  pubsub,
  user,
  Model,
  Collection,
  KanbanSupplyAreaCollection,
  KanbanContainerCollection,
  KanbanComponentCollection,
  KanbanSettingCollection,
  KanbanTableView,
  KanbanEntryCollection,
  KanbanPrintQueueBuilder
) {
  'use strict';

  var UNLOAD_DELAY = 60000;

  var loading = false;
  var loaded = false;
  var unloadTimer = null;
  var kanbanState = new Model();

  kanbanState.nlsDomain = 'kanban';
  kanbanState.broker = null;
  kanbanState.pubsub = null;
  kanbanState.url = '/kanban/state';
  kanbanState.settings = new KanbanSettingCollection();
  kanbanState.tableView = new KanbanTableView({_id: 'mine'}, {state: kanbanState});
  kanbanState.supplyAreas = new KanbanSupplyAreaCollection(null, {
    paginate: false,
    rqlQuery: 'sort(_id)'
  });
  kanbanState.containers = new KanbanContainerCollection(null, {
    paginate: false,
    rqlQuery: 'sort(name)'
  });
  kanbanState.components = new KanbanComponentCollection(null, {
    paginate: false,
    rqlQuery: 'exclude(changes)&sort(_id)'
  });
  kanbanState.entries = new KanbanEntryCollection(null, kanbanState);
  kanbanState.builder = KanbanPrintQueueBuilder.fromLocalStorage();
  kanbanState.auth = {};

  kanbanState.isLoading = function() { return loading; };

  kanbanState.parse = function(data)
  {
    ['supplyAreas', 'containers', 'components', 'entries'].forEach(function(type)
    {
      if (typeof data[type] === 'string')
      {
        var collection = JSON.parse(data[type]);

        kanbanState[type].reset(kanbanState[type].parse({
          totalCount: collection.length,
          collection: collection
        }));
      }
    });

    return {};
  };

  kanbanState.load = function(force)
  {
    if (unloadTimer !== null)
    {
      clearTimeout(unloadTimer);
      unloadTimer = null;
    }

    if (loaded && !force)
    {
      return;
    }

    if (kanbanState.broker === null)
    {
      kanbanState.broker = broker.sandbox();

      kanbanState.broker.subscribe('user.reloaded', cacheAuth);
    }

    if (kanbanState.pubsub === null)
    {
      kanbanState.pubsub = pubsub.sandbox();

      kanbanState.settings.setUpPubsub(kanbanState.pubsub);
      kanbanState.tableView.setUpPubsub(kanbanState.pubsub);
      kanbanState.supplyAreas.setUpPubsub(kanbanState.pubsub);
      kanbanState.containers.setUpPubsub(kanbanState.pubsub);
      kanbanState.components.setUpPubsub(kanbanState.pubsub);
      kanbanState.entries.setUpPubsub(kanbanState.pubsub);
    }

    cacheAuth();

    return $.when(
      kanbanState.settings.fetch({reset: true}),
      kanbanState.tableView.fetch(),
      kanbanState.fetch()
    );
  };

  kanbanState.unload = function()
  {
    if (!loaded)
    {
      return;
    }

    if (unloadTimer !== null)
    {
      clearTimeout(unloadTimer);
    }

    unloadTimer = setTimeout(function()
    {
      if (kanbanState.broker !== null)
      {
        kanbanState.broker.destroy();
        kanbanState.broker = null;
      }

      if (kanbanState.pubsub !== null)
      {
        kanbanState.pubsub.destroy();
        kanbanState.pubsub = null;
      }

      kanbanState.settings.reset([]);
      kanbanState.supplyAreas.reset([]);
      kanbanState.containers.reset([]);
      kanbanState.components.reset([]);
      kanbanState.entries.reset([]);

      unloadTimer = null;
      loaded = false;
    }, UNLOAD_DELAY);
  };

  kanbanState.on('request', function()
  {
    loading = true;
  });

  kanbanState.on('sync', function()
  {
    loading = false;
    loaded = true;
  });

  kanbanState.on('error', function()
  {
    loading = false;
    loaded = false;

    kanbanState.supplyAreas.reset([]);
    kanbanState.containers.reset([]);
    kanbanState.components.reset([]);
    kanbanState.entries.reset([]);
  });

  function cacheAuth()
  {
    kanbanState.auth = {
      view: user.isAllowedTo('KANBAN:VIEW'),
      manage: user.isAllowedTo('KANBAN:MANAGE'),
      processEngineer: user.isAllowedTo('FN:process-engineer'),
      leader: user.isAllowedTo('FN:leader', 'FN:master'),
      whman: user.isAllowedTo('FN:whman', 'FN:wh')
    };
  }

  return window.kanbanState = kanbanState;
});
