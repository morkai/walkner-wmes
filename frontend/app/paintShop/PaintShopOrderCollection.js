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
      this.totalQuantities = {};

      this.on('request', function()
      {
        this.serializedList = null;
        this.serializedMap = null;
      });

      this.on('change', function(order)
      {
        if (this.serializedMap && this.serializedMap[order.id])
        {
          _.assign(this.serializedMap[order.id], order.serialize(true));
        }
      });
    },

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(PaintShopOrder.parse);
    },

    genClientUrl: function()
    {
      return '/paintShop/' + this.getDateFilter();
    },

    isDateFilter: function(expected)
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'date' && term.args[1] === expected;
      });
    },

    getDateFilter: function(format)
    {
      var dateFilter = null;

      this.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'date')
        {
          dateFilter = time.utc.getMoment(term.args[1], 'YYYY-MM-DD').format(format || 'YYYY-MM-DD');
        }
      });

      return dateFilter;
    },

    setDateFilter: function(newDate)
    {
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
      var totalQuantities = {
        all: {
          new: 0,
          started: 0,
          partial: 0,
          finished: 0,
          cancelled: 0
        }
      };

      orders.forEach(function(order)
      {
        var serializedOrder = serializedMap[order.id] = order.serialize(true);

        serializedOrder.followups = serializedOrder.followups
          .filter(function(followupId) { return !!orders.get(followupId); })
          .map(function(followupId)
          {
            return {
              id: followupId,
              no: orders.get(followupId).get('no')
            };
          });

        serializedList.push(serializedOrder);

        mrpMap[serializedOrder.mrp] = 1;

        if (!totalQuantities[serializedOrder.mrp])
        {
          totalQuantities[serializedOrder.mrp] = {
            new: 0,
            started: 0,
            partial: 0,
            finished: 0,
            cancelled: 0
          };
        }

        totalQuantities.all[serializedOrder.status] += serializedOrder.qtyPaint;
        totalQuantities[serializedOrder.mrp][serializedOrder.status] += serializedOrder.qtyPaint;
      });

      orders.serializedList = serializedList;
      orders.serializedMap = serializedMap;
      orders.allMrps = Object.keys(mrpMap).sort();
      orders.totalQuantities = totalQuantities;

      if (orders.selectedMrp !== 'all' && !mrpMap[orders.selectedMrp])
      {
        orders.selectMrp('all');
      }

      return serializedList;
    },

    recountTotals: function()
    {
      var totalQuantities = {
        all: {
          new: 0,
          started: 0,
          partial: 0,
          finished: 0,
          cancelled: 0
        }
      };

      this.forEach(function(order)
      {
        var mrp = order.get('mrp');
        var status = order.get('status');
        var qtyPaint = order.get('qtyPaint');

        if (!totalQuantities[mrp])
        {
          totalQuantities[mrp] = {
            new: 0,
            started: 0,
            partial: 0,
            finished: 0,
            cancelled: 0
          };
        }

        totalQuantities.all[status] += qtyPaint;
        totalQuantities[mrp][status] += qtyPaint;
      });

      this.totalQuantities = totalQuantities;

      this.trigger('totalsRecounted');
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
      var recountTotals = silent;

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

        if (!order)
        {
          return;
        }

        order.set(PaintShopOrder.parse(changed), {silent: silent});

        if (changed.qtyPaint || changed.status)
        {
          recountTotals = true;
        }
      });

      if (silent)
      {
        orders.allMrps = null;
        orders.serializedList = null;
        orders.serializedMap = null;

        orders.sort({silent: true});
        orders.trigger('reset', orders);
      }
      else if (recountTotals)
      {
        orders.recountTotals();
      }
    }

  }, {

    forDate: function(date)
    {
      return new this(null, {rqlQuery: 'sort(date,no)&limit(0)&date=' + date});
    }

  });
});
