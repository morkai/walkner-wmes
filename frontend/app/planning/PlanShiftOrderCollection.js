// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './PlanShiftOrder',
  './util/shift'
], function(
  _,
  time,
  Collection,
  PlanShiftOrder,
  shiftUtil
) {
  'use strict';

  var PROPERTIES = [
    '_id',
    'prodLine',
    'shift',
    'orderId',
    'operationNo',
    'quantityDone',
    'startedAt',
    'finishedAt'
  ];

  return Collection.extend({

    model: PlanShiftOrder,

    initialize: function(models, options)
    {
      var self = this;

      self.plan = options.plan;

      self.shiftStartTime = 0;
      self.shiftEndTime = 0;

      self.cache = {
        byLine: {},
        byOrder: {}
      };

      self.updateShiftTime();

      self.plan.on('change:_id', self.updateShiftTime.bind(self));

      self.on('reset', function()
      {
        self.cache = {
          byLine: {},
          byOrder: {}
        };

        self.forEach(self.cacheOrder, self);
      });

      self.on('add', self.cacheOrder, self);

      self.forEach(self.cacheOrder, self);
    },

    url: function()
    {
      return '/planning/shiftOrders/' + this.plan.id;
    },

    updateShiftTime: function()
    {
      var planMoment = time.getMoment(this.plan.id, 'YYYY-MM-DD').hours(6);

      this.shiftStartTime = planMoment.valueOf();
      this.shiftEndTime = planMoment.add(1, 'days').valueOf();
    },

    findOrders: function(orderNo, line, shift)
    {
      var shiftOrders = this.cache.byOrder[orderNo] || [];

      if (line)
      {
        shiftOrders = shiftOrders.filter(function(shiftOrder) { return shiftOrder.get('prodLine') === line; });
      }

      if (shift)
      {
        shiftOrders = shiftOrders.filter(function(shiftOrder) { return shiftOrder.get('shift') === shift; });
      }

      return shiftOrders;
    },

    getTotalQuantityDone: function(line, lineOrder)
    {
      var orderNo = lineOrder.get('orderNo');
      var planOrder = this.plan.orders.get(orderNo);

      if (!planOrder)
      {
        return 0;
      }

      var cache = this.cache.byLine;
      var startAt = Date.parse(lineOrder.get('startAt'));
      var shift = shiftUtil.getShiftNo(startAt);
      var operationNo = planOrder.getOperationNo();
      var planShiftOrders = cache[line] && cache[line][shift] && cache[line][shift][orderNo];
      var totalQuantityDone = 0;

      if (!planShiftOrders)
      {
        return totalQuantityDone;
      }

      planShiftOrders.forEach(function(pso)
      {
        var opNo = pso.get('operationNo');

        if (!operationNo || !opNo || operationNo === opNo)
        {
          totalQuantityDone += pso.get('quantityDone') || 0;
        }
      });

      return totalQuantityDone;
    },

    update: function(data)
    {
      data = data.prodShiftOrders;

      if (!data)
      {
        return;
      }

      var self = this;

      if (Array.isArray(data))
      {
        data.forEach(function(pso) { self.addOrder(pso); });

        return;
      }

      var pso = self.get(data._id);

      if (pso)
      {
        pso.set(_.pick(data, PROPERTIES));
      }
      else if (data._id)
      {
        self.addOrder(data);
      }
    },

    addOrder: function(data)
    {
      if (this.plan.orders.get(data.orderId))
      {
        this.add(data, {merge: true});
      }
    },

    cacheOrder: function(planShiftOrder)
    {
      var byLine = this.cache.byLine;
      var byOrder = this.cache.byOrder;
      var line = planShiftOrder.get('prodLine');
      var shift = planShiftOrder.get('shift');
      var orderNo = planShiftOrder.get('orderId');
      var startedAt = Date.parse(planShiftOrder.get('startedAt'));

      if (startedAt < this.shiftStartTime)
      {
        return;
      }
      else if (startedAt > this.shiftEndTime)
      {
        return;
      }

      if (!byLine[line])
      {
        byLine[line] = {};
      }

      if (!byLine[line][shift])
      {
        byLine[line][shift] = {};
      }

      if (!byLine[line][shift][orderNo])
      {
        byLine[line][shift][orderNo] = [];
      }

      byLine[line][shift][orderNo].push(planShiftOrder);

      if (!byOrder[orderNo])
      {
        byOrder[orderNo] = [];
      }

      byOrder[orderNo].push(planShiftOrder);
    }

  });
});
