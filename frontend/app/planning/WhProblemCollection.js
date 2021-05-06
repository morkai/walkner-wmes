// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhOrderStatus'
], function(
  Collection,
  WhProblem
) {
  'use strict';

  return Collection.extend({

    model: WhProblem,

    paginate: false,

    url: function()
    {
      return '/old/wh/orders?select(order,lines._id)&limit(0)&status=problem';
    },

    parse: function(res)
    {
      const data = [];

      (res.collection || []).forEach(whOrder =>
      {
        whOrder.lines.forEach(line =>
        {
          data.push({
            _id: `${whOrder.order}_${line._id}`,
            order: whOrder.order,
            line: line._id
          });
        });
      });

      return data;
    },

    isProblem: function(line, order)
    {
      return !!this.get(`${order}_${line}`);
    },

    handleChange: function(change)
    {
      if (change.state == null || change.order == null)
      {
        this.fetch();

        return;
      }

      if (change.state)
      {
        this.add({
          _id: `${change.order}_${change.line}`,
          order: change.order,
          line: change.line
        });
      }
      else
      {
        this.remove(`${change.order}_${change.line}`);
      }
    }

  });
});
