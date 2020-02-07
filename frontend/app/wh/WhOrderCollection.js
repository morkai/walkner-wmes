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
    }

  }, {

    act: function(date, action, data)
    {
      if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
      {
        date = time.utc.format(date, 'YYYY-MM-DD');
      }

      return $.ajax({
        method: 'POST',
        url: '/wh/plans/' + date + ';act',
        data: JSON.stringify({
          action: action,
          data: data
        })
      });
    }

  });
});
