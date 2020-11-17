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

    getLineOrderExecution: function(line, lineOrder)
    {
      var key = line + lineOrder.id;

      if (this.cache.execution[key])
      {
        return this.cache.execution[key];
      }

      var orderNo = lineOrder.get('orderNo');
      var planOrder = this.plan.orders.get(orderNo);
      var execution = this.cache.execution[key] = {
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

      var lineShiftOrders = this.cache.byLine[line];

      if (!lineShiftOrders)
      {
        return execution;
      }

      var utcStartAt = Date.parse(lineOrder.get('startAt'));
      var localStartAt = time.utc.getMoment(utcStartAt).local(true).valueOf();
      var timeWindow = 4 * 3600 * 1000;
      var fromTime = localStartAt - timeWindow;
      var toTime = localStartAt + timeWindow;
      var requiredOperationNo = planOrder.getOperationNo();
      var requiredShiftStartTime = shiftUtil.getShiftStartTime(localStartAt, true);
      var requiredDayStartTime = shiftUtil.getFirstShiftStartTime(requiredShiftStartTime, true);
      var requiredDayEndTime = requiredDayStartTime + shiftUtil.SHIFT_DURATION * 3;
      var shiftEndTime = requiredShiftStartTime + shiftUtil.SHIFT_DURATION;
      var nextShiftOverlap = toTime - shiftEndTime;

      if (nextShiftOverlap > 0)
      {
        var nextShiftNo = shiftUtil.getShiftNo(localStartAt, true) + 1;
        var nextShiftWorking = nextShiftNo !== 4 && _.findLastIndex(
          lineShiftOrders.all, function(pso) { return pso.attributes.shift === nextShiftNo; }
        ) !== -1;

        if (nextShiftWorking)
        {
          nextShiftOverlap = 0;
        }
      }

      this.findOrders(orderNo, line).forEach(function(pso)
      {
        var quantityDone = pso.attributes.quantityDone;

        if (!quantityDone)
        {
          return;
        }

        var actualOperationNo = pso.attributes.operationNo;

        if (!requiredOperationNo || !actualOperationNo || actualOperationNo !== requiredOperationNo)
        {
          return;
        }

        execution.quantityDoneOnLine += quantityDone;

        var startedAt = Date.parse(pso.attributes.startedAt);

        if (startedAt >= requiredDayStartTime && startedAt <= requiredDayEndTime)
        {
          execution.quantityDoneOnDay += quantityDone;
        }

        if (shiftUtil.getShiftStartTime(startedAt, true) === requiredShiftStartTime)
        {
          execution.quantityDoneOnShift += quantityDone;
        }

        if (startedAt >= fromTime && startedAt <= toTime)
        {
          execution.plannedQuantityDone += quantityDone;
          execution.plannedQuantitiesDone.push(quantityDone);
        }
        else if (pso.attributes.shift === 1 && nextShiftOverlap > 0 && startedAt > toTime)
        {
          fromTime = shiftUtil.getShiftStartTime(startedAt, true);
          toTime = fromTime + nextShiftOverlap;

          if (startedAt >= fromTime && startedAt <= toTime)
          {
            execution.plannedQuantityDone += quantityDone;
            execution.plannedQuantitiesDone.push(quantityDone);
          }
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
