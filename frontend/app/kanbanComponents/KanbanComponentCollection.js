// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KanbanComponent'
], function(
  Collection,
  KanbanComponent
) {
  'use strict';

  var COLORS = [
    'darkblue',
    'violet',
    'lavender',
    'lightblue',
    'grey',
    'red',
    'orange',
    'yellow',
    'sand',
    'green'
  ];

  return Collection.extend({

    model: KanbanComponent,

    rqlQuery: 'sort(_id)&limit(20)',

    setUpPubsub: function(pubsub)
    {
      pubsub.subscribe('kanban.components.*', this.handleMessage.bind(this));
    },

    handleMessage: function(message, topic)
    {
      var component = this.get(message.model._id);

      switch (topic)
      {
        case 'kanban.components.deleted':
          this.remove(component);
          break;

        case 'kanban.components.added':
        case 'kanban.components.edited':
        {
          if (component)
          {
            component.set(message.model);
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
      return KanbanComponent.getColor(color);
    },

    getColors: function()
    {
      return COLORS.map(this.getColor);
    }

  });
});
