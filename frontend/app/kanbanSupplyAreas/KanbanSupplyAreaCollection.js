// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KanbanSupplyArea'
], function(
  Collection,
  KanbanSupplyArea
) {
  'use strict';

  return Collection.extend({

    model: KanbanSupplyArea,

    rqlQuery: 'sort(name,workCenter)&limit(-1)',

    initialize: function()
    {
      this.cached = null;
    },

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.supplyAreas.*', this.handleMessage.bind(this));
    },

    getAsSelect2: function(prop, names)
    {
      var map = {};

      this.forEach(function(model)
      {
        if (names.length && names.indexOf(model.get('name')) === -1)
        {
          return;
        }

        var v = model.get(prop);

        if (v.length)
        {
          map[model.get(prop)] = 1;
        }
      });

      return Object.keys(map).sort().map(function(k)
      {
        return {
          id: k,
          text: k
        };
      });
    },

    getNames: function()
    {
      return this.getAsSelect2('name', []);
    },

    getFamilies: function(names)
    {
      return this.getAsSelect2('family', names);
    },

    getWorkCenters: function(names)
    {
      return this.getAsSelect2('workCenter', names);
    },

    findByWorkCenters: function(name, workCenters)
    {
      var cached = this.cache()[name];

      if (!cached)
      {
        return null;
      }

      if (!workCenters.length)
      {
        if (cached.list.length === 1)
        {
          return cached.list[0].sa;
        }

        return null;
      }

      var candidates = [];

      workCenters.forEach(function(wc)
      {
        if (cached.map[wc])
        {
          candidates.push(cached.map[wc]);
        }
      });

      return candidates.length === 1 ? candidates[0] : null;
    },

    handleMessage: function(message, topic)
    {
      var supplyArea = this.get(message.model._id);

      this.cached = null;

      switch (topic)
      {
        case 'kanban.supplyAreas.deleted':
          this.remove(supplyArea);
          break;

        case 'kanban.supplyAreas.added':
        case 'kanban.supplyAreas.edited':
        {
          if (supplyArea)
          {
            supplyArea.set(message.model);
          }
          else
          {
            this.add(message.model);
          }

          break;
        }
      }
    },

    cache: function()
    {
      if (this.cached !== null)
      {
        return this.cached;
      }

      var cached = this.cached = {};

      this.forEach(function(sa)
      {
        var name = sa.get('name');
        var wc = sa.get('workCenter');

        if (!cached[name])
        {
          cached[name] = {
            map: {},
            list: []
          };
        }

        cached[name].map[wc] = sa;
        cached[name].list.push({wc: wc, sa: sa});
      });

      return cached;
    }

  });
});
