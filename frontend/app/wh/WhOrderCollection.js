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

      this.byOrderNo = {};

      if (options.groupByOrderNo)
      {
        this.on('reset', this.groupByOrderNo);

        if (this.length)
        {
          this.groupByOrderNo();
        }
      }
    },

    setCurrentDate: function()
    {
      this.setDateFilter(getCurrentDate());
    },

    getDateFilter: function()
    {
      return this.date;
    },

    setDateFilter: function(date)
    {
      this.date = date;
    },

    url: function()
    {
      if (!this.date)
      {
        return '/old/wh/orders';
      }

      return '/old/wh/orders'
        + '?sort(group,line,startTime)'
        + '&date=' + time.utc.getMoment(this.date, 'YYYY-MM-DD').valueOf();
    },

    getFilters: function(plan)
    {
      return {
        whStatuses: plan.displayOptions.get('whStatuses') || [],
        psStatuses: plan.displayOptions.get('psStatuses') || [],
        distStatuses: plan.displayOptions.get('distStatuses') || [],
        startTime: plan.displayOptions.getStartTimeRange(plan.id)
      };
    },

    serialize: function(plan)
    {
      var prev = null;
      var filters = this.getFilters(plan);

      return this.map(function(whOrder, i)
      {
        var item = whOrder.serialize(plan, i, filters);

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
      return this.constructor.act(data.date || this.date, action, data);
    },

    groupByOrderNo: function()
    {
      var byOrderNo = {};

      this.forEach(function(whOrder)
      {
        var orderNo = whOrder.get('order');

        if (!byOrderNo[orderNo])
        {
          byOrderNo[orderNo] = [];
        }

        byOrderNo[orderNo].push(whOrder);
      });

      this.byOrderNo = byOrderNo;
    },

    serializeSet: function(setNo, plan, whUser)
    {
      var setOrders = this.getOrdersBySet(setNo);
      var delivered = this.isSetDelivered(setOrders.map(function(o) { return o.order; }));

      return setOrders.map(function(o)
      {
        return o.order.serializeSet({i: o.i, delivered: delivered}, plan, whUser);
      });
    },

    getOrdersBySet: function(setNo)
    {
      var setOrders = [];

      this.forEach(function(order, i)
      {
        if (order.get('set') === setNo)
        {
          setOrders.push({
            i: i,
            order: order
          });
        }
      });

      return setOrders;
    },

    isSetDelivered: function(set)
    {
      if (typeof set === 'number')
      {
        set = this.getOrdersBySet(set).map(function(o) { return o.order; });
      }
      else if (!set)
      {
        set = [];
      }

      return set.some(function(order)
      {
        return order.isDelivered();
      });
    }

  }, {

    act: function(date, action, data)
    {
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
      {
        date = time.utc.format(date, 'YYYY-MM-DD');
      }

      data.date = date;

      return $.ajax({
        method: 'POST',
        url: '/old/wh;act',
        data: JSON.stringify({
          action: action,
          data: data
        })
      });
    }

  });
});
