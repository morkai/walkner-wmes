// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../core/util/getShiftStartInfo',
  '../core/Collection',
  './PaintShopOrder'
], function(
  _,
  $,
  time,
  getShiftStartInfo,
  Collection,
  PaintShopOrder
) {
  'use strict';

  return Collection.extend({

    model: PaintShopOrder,

    comparator: 'no',

    initialize: function()
    {
      this.selectedMrp = 'all';
      this.allMrps = null;
      this.serializedList = null;
      this.serializedMap = null;

      this.on('request', function()
      {
        this.serializedList = null;
        this.serializedMap = null;
      });

      this.on('change', function(order)
      {
        if (this.serializedMap)
        {
          this.serializedMap[order.id] = order.serialize();
        }
      });
    },

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(PaintShopOrder.parse);
    },

    genClientUrl: function()
    {
      return '/paintShop/' + (this.isDateFilter('current') ? 'current' : this.getDateFilter());
    },

    isDateFilter: function(expected)
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === expected;
      });
    },

    isDateCurrent: function()
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === 'current';
      });
    },

    getDateFilter: function(format)
    {
      var dateFilter;

      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date' && term.args[1] !== 'current')
        {
          dateFilter = time.getMoment(term.args[1], 'YYYY-MM-DD').format(format || 'YYYY-MM-DD');
        }
      });

      if (!dateFilter)
      {
        dateFilter = this.constructor.getCurrentDate(format);
      }

      return dateFilter;
    },

    setDateFilter: function(newDate)
    {
      var currentDate = this.constructor.getCurrentDate();

      if (newDate === currentDate)
      {
        newDate = 'current';
      }

      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date')
        {
          term.args[1] = newDate;
        }
      });
    },

    selectMrp: function(newSelectedMrp)
    {
      this.selectedMrp = this.selectedMrp === newSelectedMrp ? 'all' : newSelectedMrp;

      this.trigger('mrpSelected');
    },

    isVisible: function(order)
    {
      return this.selectedMrp === 'all' || order.get('mrp') === this.selectedMrp;
    },

    getFirstByOrderNo: function(orderNo)
    {
      return this.find(function(o) { return o.get('order') === orderNo; });
    },

    serialize: function()
    {
      var orders = this;

      if (orders.serializedList)
      {
        return orders.serializedList;
      }

      var serializedList = [];
      var serializedMap = {};
      var mrpMap = {};

      orders.forEach(function(order)
      {
        var serializedOrder = serializedMap[order.id] = order.serialize();

        serializedOrder.followups = serializedOrder.followups.map(function(followupId)
        {
          return {
            id: followupId,
            no: orders.get(followupId).get('no')
          };
        });

        serializedList.push(serializedOrder);

        mrpMap[serializedOrder.mrp] = 1;
      });

      if (!mrpMap[orders.selectedMrp])
      {
        orders.selectedMrp = 'all';
      }

      orders.serializedList = serializedList;
      orders.serializedMap = serializedMap;
      orders.allMrps = Object.keys(mrpMap).sort();

      return serializedList;
    },

    act: function(reqData, done)
    {
      var collection = this;
      var url = collection.url;

      if (reqData.orderId)
      {
        url = '/paintShop/orders/' + reqData.orderId;
      }

      var req = $.ajax({
        method: 'PATCH',
        url: url,
        data: JSON.stringify(reqData)
      });

      collection.trigger('request', this, req, {});

      req.fail(function(xhr)
      {
        var error = xhr.responseJSON ? xhr.responseJSON.error : null;

        if (!error)
        {
          error = {message: xhr.statusText};
        }

        error.statusCode = xhr.status;

        done(error);

        collection.trigger('error', req);
      });

      req.done(function(res)
      {
        done(null, res);

        collection.trigger('sync', res, req);
      });

      return req;
    },

    applyChanges: function(changes)
    {
      var orders = this;
      var silent = changes.removed.length > 0 || changes.added.length > 0;

      if (!silent)
      {
        for (var i = 0; i < changes.changed.length; ++i)
        {
          if (changes.changed[i].no > 0)
          {
            silent = true;

            break;
          }
        }
      }

      orders.remove(changes.removed, {silent: silent});

      changes.added.forEach(function(added)
      {
        orders.add(PaintShopOrder.parse(added), {silent: silent});
      });

      changes.changed.forEach(function(changed)
      {
        var order = orders.get(changed._id);

        if (order)
        {
          order.set(PaintShopOrder.parse(changed), {silent: silent});
        }
      });

      if (silent)
      {
        orders.serializedList = null;
        orders.serializedMap = null;

        orders.trigger('reset', orders);
      }
    }

  }, {

    getCurrentDate: function(format)
    {
      var moment = time.getMoment();

      if (moment.hours() < 17)
      {
        moment.startOf('day').subtract(1, 'days');
      }
      else
      {
        moment.startOf('day').add(1, 'days');
      }

      return time.utc.getMoment(moment.format('YYYY-MM-DD'), 'YYYY-MM-DD').format(format || 'YYYY-MM-DD');
    },

    forCurrentDate: function()
    {
      return this.forDate('current');
    },

    forDate: function(date)
    {
      return new this(null, {rqlQuery: 'sort(date,no)&limit(0)&date=' + date});
    }

  });
});
