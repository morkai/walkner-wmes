// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './VisNodePosition'
], function(
  Collection,
  VisNodePosition
) {
  'use strict';

  return Collection.extend({

    model: VisNodePosition,

    subscribe: function(pubsub)
    {
      pubsub.subscribe('vis.nodePositions.updated', this.onUpdated.bind(this));
    },

    getPosition: function(id)
    {
      var nodePosition = this.get(id);

      if (!nodePosition)
      {
        return {
          fixed: false,
          x: 0,
          y: 0
        };
      }

      return {
        fixed: true,
        x: nodePosition.get('x'),
        y: nodePosition.get('y')
      };
    },

    update: function(id, x, y)
    {
      var collection = this;
      var nodePosition = collection.get(id) || new VisNodePosition({
        _id: id,
        x: null,
        y: null
      });

      if (nodePosition.same(x, y))
      {
        return null;
      }

      collection.add(nodePosition);

      var old = nodePosition.attributes;
      var req = nodePosition.save({x: x, y: y});

      req.fail(function()
      {
        nodePosition.set(old);
      });

      return req;
    },

    onUpdated: function(updated)
    {
      this.add(updated, {merge: true});
    }

  });
});
