// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  'app/data/localStorage',
  './WhLine'
], function(
  _,
  user,
  Collection,
  getShiftStartInfo,
  localStorage,
  WhLine
) {
  'use strict';

  var REFRESH_PROPS = ['pickup', 'available', 'redirLine'];

  return Collection.extend({

    model: WhLine,

    rqlQuery: 'sort(_id)&limit(0)',

    initialize: function(models, options)
    {
      this.filters = {working: null, mrps: []};

      this.on('filtered', function()
      {
        localStorage.setItem('WMES_WH_LINES_FILTERS', JSON.stringify(this.filters));
      });

      if (options && options.filters)
      {
        this.setFilters(options.filters);
      }
    },

    getFilters: function()
    {
      return this.filters;
    },

    setFilters: function(filters)
    {
      Object.assign(this.filters, filters);

      this.trigger('filtered');
    },

    isVisible: function(line)
    {
      var filters = this.filters;

      if (filters.working !== null && line.get('working') !== filters.working)
      {
        return false;
      }

      if (filters.mrps.length && !line.get('mrps').some(function(mrp) { return filters.mrps.includes(mrp); }))
      {
        return false;
      }

      return true;
    },

    comparator: function(a, b)
    {
      return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
    },

    handleUpdate: function(message)
    {
      var collection = this;
      var fetch = false;

      if (message.added)
      {
        collection.add(message.added, {merge: true});
      }

      if (message.deleted)
      {
        message.deleted.forEach(function(d) { collection.remove(d._id); });
      }

      if (message.updated)
      {
        message.updated.forEach(function(d)
        {
          var model = collection.get(d._id);

          if (model)
          {
            model.set(d);
          }
          else if (!fetch && _.intersection(Object.keys(d), REFRESH_PROPS).length)
          {
            fetch = true;
          }
        });
      }

      return fetch ? collection.fetch() : null;
    }

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('WH:MANAGE', 'PLANNING:MANAGE', 'PLANNING:PLANNER');
      },

      redir: function()
      {
        return this.manage();
      }

    },

    fromQuery: function(query)
    {
      var WhLineCollection = this;
      var filters = JSON.parse(localStorage.getItem('WMES_WH_LINES_FILTERS') || '{}');

      if (Object.keys(query).length)
      {
        filters.working = query.working === '1' ? true : query.working === '0' ? false : null;
        filters.mrps = (query.mrps || '').split(',').filter(function(v) { return !!v.length; });
      }

      return new WhLineCollection(null, {
        filters: filters
      });
    }

  });
});
