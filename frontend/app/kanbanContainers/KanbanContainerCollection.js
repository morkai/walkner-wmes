// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KanbanContainer'
], function(
  Collection,
  KanbanContainer
) {
  'use strict';

  return Collection.extend({

    model: KanbanContainer,

    rqlQuery: 'sort(_id)&limit(-1337)',

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.containers.*', this.handleMessage.bind(this));
    },

    handleMessage: function(message, topic)
    {
      var container = this.get(message.model._id);

      switch (topic)
      {
        case 'kanban.containers.deleted':
          this.remove(container);
          break;

        case 'kanban.containers.added':
        case 'kanban.containers.edited':
        {
          if (container)
          {
            container.set(message.model);
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
