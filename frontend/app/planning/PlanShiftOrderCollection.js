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

  var PROPERTIES = ['_id', 'prodLine', 'shift', 'orderId', 'quantityDone', 'startedAt', 'finishedAt'];

  return Collection.extend({

    model: PlanShiftOrder,

    initialize: function(models, options)
    {
      var self = this;

      self.plan = options.plan;

      self.shiftStartTime = 0;
      self.shiftEndTime = 0;

      self.cache = {};

      self.plan.on('change:_id', self.updateShiftTime.bind(self));

      self.on('reset', function()
      {
        self.cache = {};

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

    getAll: function(line, shift, orderNo)
    {
      var cache = this.cache;

      return cache[line]
        && cache[line][shift]
        && cache[line][shift][orderNo]
        || [];
    },

    getTotalQuantityDone: function(line, shift, orderNo)
    {
      var cache = this.cache;
      var planShiftOrders = cache[line] && cache[line][shift] && cache[line][shift][orderNo];

      return planShiftOrders
        ? planShiftOrders.reduce(function(total, pso) { return total + (pso.get('quantityDone') || 0); }, 0)
        : 0;
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
        data.forEach(pso => self.addOrder(pso));

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
      var cache = this.cache;
      var line = planShiftOrder.get('prodLine');
      var shift = planShiftOrder.get('shift');
      var orderNo = planShiftOrder.get('orderId');

      if (!cache[line])
      {
        cache[line] = {};
      }

      if (!cache[line][shift])
      {
        cache[line][shift] = {};
      }

      if (!cache[line][shift][orderNo])
      {
        cache[line][shift][orderNo] = [];
      }

      cache[line][shift][orderNo].push(planShiftOrder);
    }

  });
});
