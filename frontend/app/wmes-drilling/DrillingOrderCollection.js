// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../core/util/getShiftStartInfo',
  '../core/Collection',
  './DrillingOrder'
], function(
  _,
  $,
  time,
  getShiftStartInfo,
  Collection,
  DrillingOrder
) {
  'use strict';

  function createEmptyTotals()
  {
    return {
      new: 0,
      started: 0,
      partial: 0,
      finished: 0,
      painted: 0,
      cancelled: 0
    };
  }

  return Collection.extend({

    model: DrillingOrder,

    comparator: 'no',

    initialize: function(models, options)
    {
      this.settings = options ? options.settings : null;
      this.user = options ? options.user : null;
      this.selectedMrp = options && options.selectedMrp ? options.selectedMrp : 'all';

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
          _.assign(this.serializedMap[order.id], order.serialize(true, this));
        }
      });
    },

    parse: function(res)
    {
      return Collection.prototype.parse.call(this, res).map(DrillingOrder.parse);
    },

    genClientUrl: function()
    {
      return '/drilling/' + this.getDateFilter();
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

    isVisible: function(serializedOrder)
    {
      return this.isMrpVisible(serializedOrder);
    },

    isMrpVisible: function(serializedOrder)
    {
      return this.selectedMrp === 'all' || serializedOrder.mrp === this.selectedMrp;
    },

    getAllByOrderNo: function(orderNo)
    {
      return this.filter(function(o)
      {
        if (o.get('order') === orderNo)
        {
          return true;
        }

        return _.some(o.get('childOrders'), function(childOrder)
        {
          return childOrder.order === orderNo;
        });
      });
    },

    getFirstByOrderNo: function(orderNo)
    {
      return this.find(function(o)
      {
        if (o.get('order') === orderNo)
        {
          return true;
        }

        return _.some(o.get('childOrders'), function(childOrder)
        {
          return childOrder.order === orderNo;
        });
      });
    },

    serialize: function(force)
    {
      var orders = this;

      if (!force && orders.serializedList)
      {
        return orders.serializedList;
      }

      var serializedList = [];
      var serializedMap = {};
      var mrpMap = {};
      var totalQuantities = {
        all: createEmptyTotals()
      };

      orders.forEach(function(order)
      {
        var serializedOrder = serializedMap[order.id] = order.serialize(true, orders);

        serializedList.push(serializedOrder);

        mrpMap[serializedOrder.mrp] = 1;

        orders.recountOrder(totalQuantities, serializedOrder);
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

    serializeTotals: function()
    {
      return this.totalQuantities[this.selectedMrp] || createEmptyTotals();
    },

    recountTotals: function()
    {
      this.totalQuantities = {
        all: createEmptyTotals()
      };

      (this.serializedList || []).forEach(this.recountOrder.bind(this, this.totalQuantities));

      this.trigger('totalsRecounted');
    },

    recountOrder: function(totalQuantities, order)
    {
      var mrp = order.mrp;
      var status = order.status;
      var qtyDrill = order.qtyDrill;

      if (!totalQuantities[mrp])
      {
        totalQuantities[mrp] = createEmptyTotals();
      }

      totalQuantities.all[status] += qtyDrill;
      totalQuantities[mrp][status] += qtyDrill;
    },

    act: function(reqData, done)
    {
      var collection = this;
      var url = collection.url;

      if (reqData.orderId)
      {
        url = '/drilling/orders/' + reqData.orderId;
      }

      if (collection.user)
      {
        reqData.user = collection.user;
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

      orders.remove(changes.removed.map(function(o) { return o._id; }), {silent: silent});

      changes.added.forEach(function(added)
      {
        orders.add(DrillingOrder.parse(added), {silent: silent});
      });

      changes.changed.forEach(function(changed)
      {
        var order = orders.get(changed._id);

        if (!order)
        {
          return;
        }

        order.set(DrillingOrder.parse(changed), {silent: silent});

        if (changed.qtyDrill || changed.status)
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

    forDate: function(date, options)
    {
      return new this(null, _.assign({rqlQuery: 'sort(date,no)&limit(0)&date=' + date}, options));
    }

  });
});
