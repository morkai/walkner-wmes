// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../core/Collection',
  './KanbanEntry'
], function(
  _,
  $,
  Collection,
  KanbanEntry
) {
  'use strict';

  return Collection.extend({

    model: KanbanEntry,

    paginate: false,

    rqlQuery: 'exclude(changes)',

    initialize: function(models, options)
    {
      this.settings = options.settings;
      this.tableView = options.tableView;
      this.supplyAreas = options.supplyAreas;
      this.components = options.components;

      this.filtered = [];
      this.filteredMap = {};

      if (this.tableView)
      {
        this.tableView.on('change:filterMode', this.onFilterModeChange, this);
        this.tableView.on('change:filter sync', this.onFilterChange, this);
        this.tableView.on('change:sort', this.onSortChange, this);

        this.supplyAreas.on('add change remove', this.onSupplyAreaUpdate, this);

        this.components.on('add change remove', this.onComponentUpdate, this);

        this.settings.on('change:value', this.onSettingChange, this);

        this.on('change', this.onEntryChange);
        this.on('reset', this.onFilterChange);

        this.onFilterChange();
      }
    },

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.import.success', this.onImport.bind(this));

      pubsub.subscribe('kanban.entries.updated', this.onUpdated.bind(this));
    },

    onFilterModeChange: function()
    {
      if (this.tableView.hasAnyFilter())
      {
        this.onFilterChange();
      }
    },

    onFilterChange: function(tableView, columnId)
    {
      var entries = this;
      var reserialize = columnId === 'workCenter';
      var filter = entries.tableView.createFilter(this);

      entries.filtered = [];
      entries.filteredMap = {};

      entries.forEach(function(entry)
      {
        entry.split().forEach(function(splitEntry)
        {
          if (reserialize)
          {
            splitEntry.serialized = null;
          }
          if (filter(splitEntry))
          {
            entries.filtered.push(splitEntry);
            entries.filteredMap[splitEntry.id] = splitEntry;
          }
        });
      });

      entries.trigger('filter');

      entries.onSortChange();
    },

    onSortChange: function()
    {
      this.filtered.sort(this.tableView.createSort(this));

      this.trigger('sort');
    },

    onSupplyAreaUpdate: function(supplyArea)
    {
      supplyArea = supplyArea.get('name');

      this.forEach(function(entry)
      {
        if (entry.get('supplyArea') === supplyArea)
        {
          entry.serialized = null;
        }
      });

      this.onFilterChange();
    },

    onComponentUpdate: function(component)
    {
      this.forEach(function(entry)
      {
        if (entry.get('nc12') === component.id)
        {
          entry.serialized = null;
        }
      });

      this.onFilterChange();
    },

    onEntryChange: function(entry)
    {
      entry.serialized = null;

      var tableView = this.tableView;

      if (!tableView)
      {
        return;
      }

      var filter = false;
      var sort = false;

      Object.keys(entry.changed).forEach(function(property)
      {
        if (!filter && tableView.getFilter(property))
        {
          filter = true;
        }
        else if (!sort && tableView.getSortOrder(property))
        {
          sort = true;
        }
      });

      if (filter)
      {
        this.onFilterChange();
      }
      else if (sort)
      {
        this.onSortChange();
      }
    },

    onImport: function(message)
    {
      if (!message.entryCount && !message.componentCount)
      {
        return;
      }

      var entries = this;
      var updatedAt = Date.parse(message.updatedAt);
      var reqs = [
        message.entryCount ? $.ajax({url: '/kanban/entries?exclude(changes)&updatedAt=' + updatedAt}) : null,
        message.componentCount ? $.ajax({url: '/kanban/components?exclude(changes)&updatedAt=' + updatedAt}) : null
      ];

      $.when.apply($, reqs).done(function(res1, res2)
      {
        if (res2 && res2[0].totalCount)
        {
          var updatedComponentList = res2[0].collection;
          var updatedNc12Map = {};

          updatedComponentList.forEach(function(d) { updatedNc12Map[d._id] = true; });

          entries.components.set(updatedComponentList, {remove: false, silent: true});

          entries.forEach(function(entry)
          {
            if (updatedNc12Map[entry.get('nc12')])
            {
              entry.serialized = null;
            }
          });
        }

        if (res1 && res1[0].totalCount)
        {
          var updatedEntryList = res1[0].collection;

          entries.set(updatedEntryList, {remove: false, silent: true});

          updatedEntryList.forEach(function(d)
          {
            entries.get(d._id).serialized = null;
          });
        }

        entries.onFilterChange();
      });
    },

    onUpdated: function(message)
    {
      var entry = this.get(message.entryId);

      if (!entry)
      {
        return;
      }

      var data = {
        updates: _.clone(entry.get('updates'))
      };

      if (message.arrayIndex === -1)
      {
        data[message.property] = message.newValue;
        data.updates[message.property] = message.updates;
      }
      else
      {
        data[message.property] = _.clone(entry.get(message.property));
        data[message.property][message.arrayIndex] = message.newValue;
        data.updates[message.property + '.' + message.arrayIndex] = message.updates;
      }

      entry.set(data);
    },

    onSettingChange: function(setting)
    {
      if (setting.id === 'kanban.rowColors')
      {
        this.forEach(function(entry) { entry.serialized = null; });
        this.onFilterChange();
      }
    }

  });
});
