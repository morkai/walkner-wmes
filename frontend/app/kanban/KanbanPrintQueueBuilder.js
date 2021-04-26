// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../core/util/uuid',
  '../core/Collection',
  '../core/Model',
  '../data/localStorage',
  './layouts'
], function(
  _,
  $,
  uuid,
  Collection,
  Model,
  localStorage,
  layouts
) {
  'use strict';

  var ENTRIES_STORAGE_KEY = 'WMES_KANBAN_BUILDER_ENTRIES';
  var LAYOUTS_STORAGE_KEY = 'WMES_KANBAN_BUILDER_LAYOUTS';

  return Collection.extend({

    model: Model,

    paginate: false,

    initialize: function(models, options)
    {
      this.layouts = options && options.layouts || [].concat(layouts);

      this.on('add remove change reset', this.store);
    },

    store: function()
    {
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(this.toJSON()));
    },

    addFromEntries: function(entries)
    {
      var builder = this;
      var ccns = {};
      var added = [];

      builder.forEach(function(model) { ccns[model.get('ccn')] = true; });

      entries.forEach(function(entry)
      {
        if (ccns[entry._id])
        {
          return;
        }

        var model = {
          _id: uuid(),
          ccn: entry._id,
          lines: entry.lines
        };

        builder.add(model, {multi: true});
        added.push(model._id);
      });

      builder.trigger('multiAdd', added);
    },

    addFromEntry: function(entry)
    {
      var model = this.findWhere({ccn: entry._id});

      if (model)
      {
        this.trigger('focus', model);
      }
      else
      {
        this.add({
          _id: uuid(),
          ccn: entry._id,
          lines: entry.lines
        });
      }
    },

    toggleLayout: function(layout, newState)
    {
      if (newState === undefined)
      {
        newState = this.layouts.indexOf(layout) === -1;
      }

      if (newState)
      {
        if (this.layouts.indexOf(layout) === -1)
        {
          this.layouts.push(layout);
        }
      }
      else
      {
        this.layouts = this.layouts.filter(function(l) { return l !== layout; });
      }

      localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(this.layouts));

      this.trigger('change:layouts', layout, newState);
    }

  }, {

    fromLocalStorage: function()
    {
      return new this(JSON.parse(localStorage.getItem(ENTRIES_STORAGE_KEY) || '[]'), {
        layouts: JSON.parse(localStorage.getItem(LAYOUTS_STORAGE_KEY) || 'null')
      });
    }

  });
});
