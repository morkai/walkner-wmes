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

    rqlQuery: 'sort(_id)&limit(20)',

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.supplyAreas.*', this.handleMessage.bind(this));
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

  });
});
