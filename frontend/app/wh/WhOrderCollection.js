// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../core/Collection',
  './WhOrder'
], function(
  _,
  $,
  time,
  Collection,
  WhOrder
) {
  'use strict';

  function getCurrentDate()
  {
    return time.utc.getMoment(Date.now())
      .startOf('day')
      .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
      .format('YYYY-MM-DD');
  }

  return Collection.extend({

    model: WhOrder,

    paginate: false,

    initialize: function(models, options)
    {
      options = _.assign({date: getCurrentDate()}, options);

      this.date = options.date;
    },

    setCurrentDate: function()
    {
      this.date = getCurrentDate();
    },

    url: function()
    {
      if (!this.date)
      {
        return '/wh/orders';
      }

      return '/wh/orders'
        + '?sort(group,line,startTime)'
        + '&date=' + time.utc.getMoment(this.date, 'YYYY-MM-DD').valueOf();
    },

    serialize: function(plan)
    {
      var prev = null;

      return this.map(function(whOrder, i)
      {
        var item = whOrder.serialize(plan, i);

        if (prev)
        {
          item.newGroup = item.group !== prev.group;
          item.newLine = item.line !== prev.line;
        }

        prev = item;

        return item;
      });
    },

    update: function(newOrders)
    {
      for (var i = 0; i < newOrders.length; ++i)
      {
        var newOrder = newOrders[i];
        var oldOrder = this.get(newOrder._id);

        if (oldOrder)
        {
          oldOrder.update(newOrder);
        }
      }
    },

    act: function(action, data)
    {
      return $.ajax({
        method: 'POST',
        url: '/wh/plans/' + this.date + ';act',
        data: JSON.stringify({
          action: action,
          data: data
        })
      });
    }

  });
});
