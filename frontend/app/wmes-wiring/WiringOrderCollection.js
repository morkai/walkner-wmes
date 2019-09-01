// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../user',
  '../core/util/getShiftStartInfo',
  '../core/Collection',
  './WiringOrder'
], function(
  _,
  $,
  time,
  user,
  getShiftStartInfo,
  Collection,
  WiringOrder
) {
  'use strict';

  var STATUSES = ['new', 'started', 'partial', 'finished', 'cancelled'];
  var STATUS_ORDERS = {
    new: 0,
    started: 1,
    partial: 2,
    finished: 3,
    cancelled: 4
  };

  function createEmptyTotals()
  {
    var totals = {
      todo: 0,
      done: 0,
      remaining: 0
    };

    STATUSES.forEach(function(status)
    {
      totals[status] = 0;
    });

    return totals;
  }

  return Collection.extend({

    model: WiringOrder,

    comparator: 'name',

    initialize: function(models, options)
    {
      this.settings = options ? options.settings : null;
      this.user = options ? options.user : null;

      this.filters = {
        mrp: options && options.mrp || 'all',
        status: options && options.status || []
      };

      this.resetState();

      this.on('request', this.resetState);

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
      return Collection.prototype.parse.call(this, res).map(WiringOrder.parse);
    },

    genClientUrl: function()
    {
      return '/wiring/' + this.getDateFilter();
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

    setStatusFilter: function(statuses)
    {
      if (statuses.length === 5)
      {
        statuses = [];
      }

      this.filters.status = statuses;

      this.trigger('filter:status');
    },

    setMrpFilter: function(mrp)
    {
      this.filters.mrp = this.filters.mrp === mrp ? 'all' : mrp;

      this.trigger('filter:mrp');
    },

    getMrps: function()
    {
      if (!this.serializedList)
      {
        if (this.length === 0)
        {
          return [];
        }

        this.serialize();
      }

      return this.allMrps;
    },

    getStats: function()
    {
      if (!this.totalQuantities)
      {
        if (this.length === 0)
        {
          return {
            all: createEmptyTotals()
          };
        }

        this.serialize();
      }

      return this.totalQuantities;
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

      if (orders.filters.mrp !== 'all' && !mrpMap[orders.filters.mrp])
      {
        orders.setMrpFilter('all');
      }

      return serializedList;
    },

    serializeTotals: function()
    {
      return this.totalQuantities[this.filters.mrp] || createEmptyTotals();
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

      if (!totalQuantities[mrp])
      {
        totalQuantities[mrp] = createEmptyTotals();
      }

      totalQuantities.all[status] += order.qtyRemaining;
      totalQuantities[mrp][status] += order.qtyRemaining;

      if (status !== 'cancelled')
      {
        totalQuantities.all.finished += order.qtyDone;
        totalQuantities[mrp].finished += order.qtyDone;

        totalQuantities.all.todo += order.qty;
        totalQuantities[mrp].todo += order.qty;

        totalQuantities.all.done += order.qtyDone;
        totalQuantities[mrp].done += order.qtyDone;

        totalQuantities.all.remaining += order.qtyRemaining;
        totalQuantities[mrp].remaining += order.qtyRemaining;
      }
    },

    canUpdate: function()
    {
      return user.isAllowedTo('LOCAL', 'WIRING:WIRER', 'WIRING:MANAGE');
    },

    act: function(reqData, done)
    {
      var collection = this;
      var url = collection.url;

      if (reqData.orderId)
      {
        url = '/wiring/orders/' + reqData.orderId;
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

      orders.remove(changes.removed, {silent: silent});

      changes.added.forEach(function(added)
      {
        orders.add(WiringOrder.parse(added), {silent: silent});
      });

      changes.changed.forEach(function(changed)
      {
        var order = orders.get(changed._id);

        if (!order)
        {
          return;
        }

        order.set(WiringOrder.parse(changed), {silent: silent});

        if (changed.qty || changed.status)
        {
          recountTotals = true;
        }
      });

      if (silent)
      {
        orders.resetState();
        orders.sort({silent: true});
        orders.trigger('reset', orders);
      }
      else if (recountTotals)
      {
        orders.recountTotals();
      }
    },

    resetState: function()
    {
      this.allMrps = null;
      this.serializedList = null;
      this.serializedMap = null;
      this.totalQuantities = {
        all: createEmptyTotals()
      };
    }

  }, {

    STATUSES: STATUSES,

    STATUS_ORDERS: STATUS_ORDERS,

    forDate: function(date, options)
    {
      return new this(null, _.assign({rqlQuery: 'sort(name)&limit(0)&date=' + date}, options));
    }

  });
});
