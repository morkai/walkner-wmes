// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanOrder'
], function(
  Collection,
  PlanOrder
) {
  'use strict';

  var KIND_WEIGHT = {
    unclassified: 0,
    small: 1,
    medium: 2,
    big: 3,
    easy: 2,
    hard: 3
  };

  function compare(a, b)
  {
    if (a.deleted !== b.deleted)
    {
      if (a.deleted)
      {
        return 1;
      }

      return -1;
    }

    var cmp = a.mrp.localeCompare(b.mrp);

    if (cmp !== 0)
    {
      return cmp;
    }

    if (a.urgent && !b.urgent)
    {
      return -1;
    }

    if (!a.urgent && b.urgent)
    {
      return 1;
    }

    if (a.incomplete && !b.incomplete)
    {
      return -1;
    }

    if (!a.incomplete && b.incomplete)
    {
      return 1;
    }

    cmp = KIND_WEIGHT[a.kind] - KIND_WEIGHT[b.kind];

    if (cmp === 0)
    {
      return a._id.localeCompare(b._id);
    }

    return cmp;
  }

  return Collection.extend({

    model: PlanOrder,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    comparator: function(a, b)
    {
      return compare(a.attributes, b.attributes);
    },

    getGroupedByMrp: function()
    {
      var mrpToOrders = {};

      this.forEach(function(order)
      {
        var mrpId = order.get('mrp');

        if (!mrpToOrders[mrpId])
        {
          mrpToOrders[mrpId] = [];
        }

        mrpToOrders[mrpId].push(order);
      });

      return mrpToOrders;
    }

  }, {

    compare: compare

  });
});
