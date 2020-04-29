// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './PlanShiftOrder'
], function(
  _,
  time,
  Collection,
  PlanShiftOrder
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

      self.updateShiftTime();
    },

    url: function()
    {
      return '/prodShiftOrders?select(' + PROPERTIES.join(',') + ')'
        + '&limit(0)&mechOrder=false'
        + '&startedAt=ge=' + this.shiftStartTime
        + '&startedAt=lt=' + this.shiftEndTime;
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

    getTotalQuantityDone: function(line, shift, orderNo, operationNo)
    {
      var cache = this.cache.byLine;
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

    updateShiftTime: function()
    {
      var planMoment = time.getMoment(this.plan.id, 'YYYY-MM-DD').hours(6);

      this.shiftStartTime = planMoment.valueOf();
      this.shiftEndTime = planMoment.add(24, 'hours').valueOf();
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
      var startedAt = Date.parse(data.startedAt);

      if (startedAt < this.shiftStartTime || startedAt >= this.shiftEndTime)
      {
        return;
      }

      this.add(_.pick(data, PROPERTIES));
    },

    cacheOrder: function(planShiftOrder)
    {
      var byLine = this.cache.byLine;
      var byOrder = this.cache.byOrder;
      var line = planShiftOrder.get('prodLine');
      var shift = planShiftOrder.get('shift');
      var orderNo = planShiftOrder.get('orderId');

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
