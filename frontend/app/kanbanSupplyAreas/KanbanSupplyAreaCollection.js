// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Collection',
  './KanbanSupplyArea'
], function(
  t,
  Collection,
  KanbanSupplyArea
) {
  'use strict';

  var COLORS = [
    'red',
    'yellow',
    'orange',
    'green',
    'violet',
    'pink',
    'lightblue',
    'darkblue',
    'brown',
    'grey'
  ];

  return Collection.extend({

    model: KanbanSupplyArea,

    rqlQuery: 'sort(_id)&limit(20)',

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.supplyAreas.*', this.handleMessage.bind(this));
    },

    getFamilies: function()
    {
      var families = {};

      this.forEach(function(supplyArea)
      {
        families[supplyArea.get('name')] = 1;
      });

      return Object.keys(families).sort().map(function(family)
      {
        return {
          id: family,
          text: family
        };
      });
    },

    handleMessage: function(message, topic)
    {
      var supplyArea = this.get(message.model._id);

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
    }

  }, {

    COLORS: COLORS,

    getColor: function(color)
    {
      return KanbanSupplyArea.getColor(color);
    },

    getColors: function()
    {
      return COLORS.map(this.getColor);
    }

  });
});
