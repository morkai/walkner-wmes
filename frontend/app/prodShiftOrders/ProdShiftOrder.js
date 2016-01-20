// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../user',
  '../time',
  '../data/prodLog',
  '../data/subdivisions',
  '../core/Model',
  '../core/util/getShiftEndDate',
  './util/decorateProdShiftOrder',
  './util/calcOrderEfficiency'
], function(
  _,
  user,
  time,
  prodLog,
  subdivisions,
  Model,
  getShiftEndDate,
  decorateProdShiftOrder,
  calcOrderEfficiency
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodShiftOrders',

    clientUrlRoot: '#prodShiftOrders',

    topicPrefix: 'prodShiftOrders',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodShiftOrders',

    defaults: {
      pressWorksheet: null,
      prodShift: null,
      division: null,
      subdivision: null,
      mrpControllers: null,
      prodFlow: null,
      workCenter: null,
      prodLine: null,
      date: null,
      shift: null,
      mechOrder: null,
      orderId: null,
      operationNo: null,
      orderData: null,
      workerCount: null,
      totalQuantity: null,
      quantityDone: null,
      quantityLost: null,
      creator: null,
      startedAt: null,
      finishedAt: null,
      master: null,
      leader: null,
      operator: null,
      operators: null
    },

    getLabel: function(includeProdLine)
    {
      var label = includeProdLine === false ? '' : (this.get('prodLine') + ': ');

      return label + this.get('orderId') + ', ' + this.get('operationNo');
    },

    serialize: function(options)
    {
      return decorateProdShiftOrder(this, options);
    },

    onShiftChanged: function()
    {
      this.clear();
    },

    onOrderChanged: function(prodShift, orderData, operationNo)
    {
      this.prepareOperations(orderData);

      var shiftDate = prodShift.get('date');
      var startedAt = time.getMoment().toDate();

      if (startedAt < shiftDate)
      {
        startedAt = new Date(shiftDate.getTime());
      }

      this.set({
        prodShift: prodShift.id,
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        date: shiftDate,
        shift: prodShift.get('shift'),
        mechOrder: orderData.no === null,
        orderId: orderData.no || orderData.nc12,
        operationNo: operationNo,
        orderData: orderData,
        workerCount: 0,
        totalQuantity: 0,
        quantityDone: 0,
        quantityLost: 0,
        losses: null,
        creator: user.getInfo(),
        startedAt: startedAt,
        finishedAt: null,
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        operators: prodShift.get('operators')
      });

      this.generateId(prodShift);
    },

    onOrderCorrected: function(prodShift, orderData, operationNo)
    {
      var orderId = orderData.no || orderData.nc12;

      if (orderId === this.get('orderId') && operationNo === this.get('operationNo'))
      {
        return null;
      }

      this.prepareOperations(orderData);

      var changes = {
        mechOrder: orderData.no === null,
        orderId: orderId,
        operationNo: operationNo,
        orderData: orderData,
        creator: user.getInfo()
      };

      this.set(changes);

      if (this.get('workerCount') > this.getMaxWorkerCount())
      {
        prodShift.changeWorkerCount(0);
      }

      if (this.get('quantityDone') > this.getMaxQuantityDone())
      {
        prodShift.changeQuantityDone(0);
      }

      return changes;
    },

    onOrderContinued: function(prodShift)
    {
      this.set({
        prodShift: prodShift.id,
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        date: prodShift.get('date'),
        shift: prodShift.get('shift'),
        workerCount: 0,
        totalQuantity: 0,
        quantityDone: 0,
        quantityLost: 0,
        losses: null,
        creator: user.getInfo(),
        startedAt: time.getMoment().toDate(),
        finishedAt: null,
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        operators: prodShift.get('operators')
      });

      this.generateId(prodShift);
    },

    generateId: function(prodShift)
    {
      this.set(
        '_id',
        prodLog.generateId(this.get('startedAt'), prodShift.id + this.get('orderId'))
      );
    },

    onWorkEnded: function()
    {
      this.clear();
    },

    isMechOrder: function()
    {
      return this.get('mechOrder');
    },

    getOrderNo: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return orderData.no || '?';
    },

    getNc12: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return orderData.nc12 || '?';
    },

    getProductName: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return orderData.name || '?';
    },

    getOperationName: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return '-';
      }

      if (!orderData.operations || !orderData.operations[operationNo])
      {
        return operationNo;
      }

      return orderData.operations[operationNo].name || operationNo;
    },

    getEfficiency: function()
    {
      return calcOrderEfficiency(this.attributes);
    },

    getTaktTime: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return '-';
      }

      var operation = orderData.operations ? orderData.operations[operationNo] : null;

      if (!operation)
      {
        return '?';
      }

      var workerCount = this.get('workerCount');

      if (!workerCount)
      {
        workerCount = this.getWorkerCountSap();
      }

      if (typeof workerCount !== 'number' || workerCount === 0 || operation.laborTime <= 0)
      {
        return '?';
      }

      return Math.max(Math.round((operation.laborTime * 1.053) / workerCount * 3600 / 100), 1);
    },

    getActualTaktTime: function()
    {
      var finishedAt = time.getMoment(this.get('finishedAt'));

      if (!finishedAt.isValid())
      {
        return '-';
      }

      var duration = finishedAt.diff(this.get('startedAt'), 'seconds');
      var quantityDone = this.get('quantityDone');

      return quantityDone ? Math.max(1, Math.round(duration / quantityDone)) : '?';
    },

    getWorkerCountSap: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return '-';
      }

      var operation = orderData.operations ? orderData.operations[operationNo] : null;

      if (!operation || operation.laborTime <= 0 || operation.machineTime <= 0)
      {
        return '?';
      }

      return Math.max(Math.round(operation.laborTime / operation.machineTime), 1);
    },

    getWorkerCount: function()
    {
      return this.get('workerCount') || 0;
    },

    getWorkerCountForEdit: function()
    {
      var workerCount = this.getWorkerCount();

      if (workerCount !== 0)
      {
        return workerCount;
      }

      workerCount = this.getWorkerCountSap();

      if (typeof workerCount === 'string' || workerCount === 0)
      {
        return 0;
      }

      return workerCount;
    },

    getMaxWorkerCount: function()
    {
      var workerCountSap = this.getWorkerCountSap();

      if (typeof workerCountSap === 'number')
      {
        return workerCountSap + Math.max(1, Math.round(workerCountSap * 0.25));
      }

      return 15;
    },

    getMaxQuantityDone: function()
    {
      var orderData = this.get('orderData');

      if (orderData && orderData.qty)
      {
        return Math.ceil(orderData.qty * 1.25);
      }

      return 999;
    },

    getStartedAt: function()
    {
      var startedAt = this.get('startedAt');

      if (!startedAt)
      {
        return '?';
      }

      return time.format(startedAt, 'HH:mm:ss');
    },

    getQuantityDone: function()
    {
      return this.get('quantityDone') || 0;
    },

    getSubdivisionType: function()
    {
      var subdivision = subdivisions.get(this.get('subdivision'));

      return subdivision ? subdivision.get('type') : null;
    },

    getOrderIdType: function()
    {
      return this.getSubdivisionType() === 'press' ? 'nc12' : 'no';
    },

    hasOrderData: function()
    {
      return !!this.get('orderId') && !!this.get('operationNo') && !!this.get('orderData');
    },

    isEditable: function()
    {
      return this.hasEnded() && !this.isFromPressWorksheet();
    },

    hasEnded: function()
    {
      return this.get('finishedAt') != null;
    },

    isFromPressWorksheet: function()
    {
      return this.get('pressWorksheet') != null;
    },

    finish: function()
    {
      if (!this.id || this.hasEnded())
      {
        return null;
      }

      var finishedAt = time.getMoment().toDate();
      var shiftEndDate = getShiftEndDate(this.get('date'), this.get('shift'));

      if (finishedAt > shiftEndDate)
      {
        finishedAt = shiftEndDate;
      }

      this.set('finishedAt', finishedAt);

      return {
        _id: this.id,
        finishedAt: finishedAt
      };
    },

    prepareOperations: function(orderData)
    {
      if (Array.isArray(orderData.operations))
      {
        var operations = {};

        orderData.operations.forEach(function(operation)
        {
          if (operation.workCenter !== '' && operation.laborTime !== -1)
          {
            operations[operation.no] = operation;
          }
        });

        orderData.operations = operations;
      }
      else if (!_.isObject(orderData.operations))
      {
        orderData.operations = {};
      }

      return orderData;
    }

  }, {

    parse: function(data)
    {
      ['date', 'startedAt', 'finishedAt', 'createdAt'].forEach(function(dateProperty)
      {
        if (typeof data[dateProperty] === 'string')
        {
          data[dateProperty] = new Date(data[dateProperty]);
        }
      });

      return data;
    }

  });

});
