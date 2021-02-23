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
        execution: {},
        byLine: {},
        byOrder: {}
      };

      self.updateShiftTime();

      self.plan.on('change:_id', self.updateShiftTime.bind(self));

      self.on('reset', function()
      {
        self.cache = {
          execution: {},
          byLine: {},
          byOrder: {}
        };

        self.forEach(self.cacheOrder, self);
      });

      self.on('add', self.cacheOrder, self);
      self.on('change:quantityDone', function()
      {
        this.cache.execution = {};
      });

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

    getExecutionOrders: function(lineId, orderNo, operationNo)
    {
      const linePsos = this.cache.byLine[lineId];
      const result = [];

      if (!linePsos)
      {
        return result;
      }

      const orderPsos = linePsos.orders[orderNo];

      if (!orderPsos)
      {
        return result;
      }

      orderPsos.forEach(pso =>
      {
        if (pso.attributes.operationNo !== operationNo)
        {
          return;
        }

        result.push({
          pso,
          quantityDone: pso.attributes.quantityDone,
          startedAt: Date.parse(pso.attributes.startedAt),
          continuation: !!result.length && result[result.length - 1].pso.nextLinePso === pso
        });
      });

      return result;
    },

    getLineOrderExecution: function(lineId, lineOrder, workingTimes)
    {
      const key = lineId + lineOrder.id;
      const cache = this.cache.execution;

      if (cache[key])
      {
        return cache[key];
      }

      if (!workingTimes)
      {
        workingTimes = this.plan.workingLines.getWorkingTimes(this.plan.lines.get(lineId));
      }

      const orderNo = lineOrder.get('orderNo');
      const planOrder = this.plan.orders.get(orderNo);
      const execution = cache[key] = {
        quantityDoneOnLine: 0,
        quantityDoneOnDay: 0,
        quantityDoneOnShift: 0,
        plannedQuantityDone: 0,
        plannedQuantitiesDone: []
      };

      if (!planOrder)
      {
        return execution;
      }

      const operationNo = planOrder.getOperationNo();
      const shiftOrders = this.getExecutionOrders(lineId, orderNo, operationNo);

      if (!shiftOrders.length)
      {
        return execution;
      }

      const qtyPlan = lineOrder.get('quantity');
      const timeWindow = 4 * 3600 * 1000;
      const utcStartAt = Date.parse(lineOrder.get('startAt'));
      const localStartAt = time.utc.getMoment(utcStartAt).local(true).valueOf();
      let fromTime = localStartAt - timeWindow;
      let toTime = localStartAt + timeWindow;
      const shiftStartTime = shiftUtil.getShiftStartTime(localStartAt, true);
      const dayStartTime = shiftUtil.getFirstShiftStartTime(shiftStartTime, true);
      const dayEndTime = dayStartTime + shiftUtil.SHIFT_DURATION * 3;
      const shiftEndTime = shiftStartTime + shiftUtil.SHIFT_DURATION;
      const prevShiftOverlap = fromTime - shiftStartTime;
      const nextShiftOverlap = toTime - shiftEndTime;

      if (workingTimes && (prevShiftOverlap < 0 || nextShiftOverlap > 0))
      {
        var shiftNo = shiftUtil.getShiftNo(localStartAt, true);

        if (prevShiftOverlap < 0 && workingTimes.prevAt[shiftNo])
        {
          fromTime = time.utc.getMoment(workingTimes.prevAt[shiftNo]).local(true).valueOf() + prevShiftOverlap;
        }

        if (nextShiftOverlap > 0 && workingTimes.nextAt[shiftNo])
        {
          toTime = time.utc.getMoment(workingTimes.nextAt[shiftNo]).local(true).valueOf() + nextShiftOverlap;
        }
      }

      shiftOrders.forEach(o =>
      {
        execution.quantityDoneOnLine += o.quantityDone;

        if (o.startedAt >= dayStartTime && o.startedAt <= dayEndTime)
        {
          execution.quantityDoneOnDay += o.quantityDone;
        }

        if (shiftUtil.getShiftStartTime(o.startedAt, true) === shiftStartTime)
        {
          execution.quantityDoneOnShift += o.quantityDone;
        }

        if (!cache[o.pso.id]
          && execution.plannedQuantityDone < qtyPlan
          && (o.startedAt >= fromTime && o.startedAt <= toTime || o.continuation))
        {
          cache[o.pso.id] = true;

          execution.plannedQuantityDone += o.quantityDone;
          execution.plannedQuantitiesDone.push(o.quantityDone, execution.plannedQuantityDone);
        }
      });

      return execution;
    },

    getTotalQuantityDone: function(line, lineOrder)
    {
      return this.getLineOrderExecution(line, lineOrder).quantityDoneOnShift;
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

    cacheOrder: function(pso)
    {
      var byLine = this.cache.byLine;
      var byOrder = this.cache.byOrder;
      var line = pso.get('prodLine');
      var shift = pso.get('shift');
      var orderNo = pso.get('orderId');

      if (!byLine[line])
      {
        byLine[line] = {
          all: [],
          orders: {}
        };
      }

      if (!byLine[line][shift])
      {
        byLine[line][shift] = {
          all: []
        };
      }

      if (!byLine[line][shift][orderNo])
      {
        byLine[line][shift][orderNo] = [];
      }

      if (!byLine[line].orders[orderNo])
      {
        byLine[line].orders[orderNo] = [];
      }

      if (!byOrder[orderNo])
      {
        byOrder[orderNo] = [];
      }

      if (byLine[line].all.length)
      {
        byLine[line].all[byLine[line].all.length - 1].nextLinePso = pso;
      }

      byLine[line].all.push(pso);
      byLine[line][shift].all.push(pso);
      byLine[line][shift][orderNo].push(pso);
      byLine[line].orders[orderNo].push(pso);
      byOrder[orderNo].push(pso);

      this.cache.execution = {};
    }

  });
});
