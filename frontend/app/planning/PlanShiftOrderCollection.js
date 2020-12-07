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

    getLineOrderExecution: function(lineId, lineOrder, workingTimes)
    {
      const key = lineId + lineOrder.id;

      if (this.cache.execution[key])
      {
        return this.cache.execution[key];
      }

      const orderNo = lineOrder.get('orderNo');
      const planOrder = this.plan.orders.get(orderNo);
      const execution = this.cache.execution[key] = {
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

      var lineShiftOrders = this.cache.byLine[lineId];

      if (!lineShiftOrders)
      {
        return execution;
      }

      const utcStartAt = Date.parse(lineOrder.get('startAt'));
      const localStartAt = time.utc.getMoment(utcStartAt).local(true).valueOf();
      const timeWindow = 4 * 3600 * 1000;
      let fromTime = localStartAt - timeWindow;
      let toTime = localStartAt + timeWindow;
      const operationNo = planOrder.getOperationNo();
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

      this.sumExecutionOrders(this.findOrders(orderNo, lineId)).forEach(pso =>
      {
        if (!operationNo || !pso.operationNo || pso.operationNo !== operationNo)
        {
          return;
        }

        execution.quantityDoneOnLine += pso.quantityDone;

        if (pso.startedAt >= dayStartTime && pso.startedAt <= dayEndTime)
        {
          execution.quantityDoneOnDay += pso.quantityDone;
        }

        if (shiftUtil.getShiftStartTime(pso.startedAt, true) === shiftStartTime)
        {
          execution.quantityDoneOnShift += pso.quantityDone;
        }

        if (pso.startedAt >= fromTime && pso.startedAt <= toTime)
        {
          execution.plannedQuantityDone += pso.quantityDone;
          execution.plannedQuantitiesDone.push(pso.quantityDone);
        }
      });

      return execution;
    },

    sumExecutionOrders: function(psos)
    {
      const summed = [];

      if (psos.length === 0)
      {
        return summed;
      }

      psos.forEach(({attributes}) =>
      {
        const pso = {
          prodLine: attributes.prodLine,
          quantityDone: attributes.quantityDone,
          operationNo: attributes.operationNo,
          startedAt: Date.parse(attributes.startedAt),
          finishedAt: Date.parse(attributes.finishedAt)
        };
        const prev = summed[summed.length - 1];

        if (prev
          && pso.prodLine === prev.prodLine
          && pso.operationNo === prev.operationNo
          && Math.abs(pso.startedAt - prev.finishedAt) < 60000)
        {
          prev.quantityDone += pso.quantityDone;
          prev.finishedAt = pso.finishedAt;
        }
        else
        {
          summed.push(pso);
        }
      });

      return summed;
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
          all: []
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

      if (!byOrder[orderNo])
      {
        byOrder[orderNo] = [];
      }

      byLine[line].all.push(pso);
      byLine[line][shift].all.push(pso);
      byLine[line][shift][orderNo].push(pso);
      byOrder[orderNo].push(pso);

      this.cache.execution = {};
    }

  });
});
