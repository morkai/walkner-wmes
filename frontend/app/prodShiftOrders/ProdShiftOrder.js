define([
  'underscore',
  '../user',
  '../time',
  '../data/prodLog',
  '../core/Model',
  '../core/util/getShiftEndDate'
], function(
  _,
  user,
  time,
  prodLog,
  Model,
  getShiftEndDate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodShiftOrders',

    clientUrlRoot: '#prodShiftOrders',

    topicPrefix: 'prodShiftOrders',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodShiftOrders',

    defaults: {
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
      quantityDone: null,
      creator: null,
      startedAt: null,
      finishedAt: null
    },

    sync: function(method)
    {
      if (method === 'read')
      {
        return Model.prototype.sync.apply(this, arguments);
      }

      throw new Error("Method not supported: " + method);
    },

    onShiftChanged: function()
    {
      this.set({
        _id: null,
        prodShift: null,
        division: null,
        subdivision: null,
        mrpControllers: null,
        prodFlow: null,
        workCenter: null,
        prodLine: null,
        date: null,
        shift: null,
        workerCount: null,
        quantityDone: null,
        creator: null,
        startedAt: null,
        finishedAt: null
      });
    },

    onOrderChanged: function(prodShift, orderData, operationNo)
    {
      this.prepareOperations(orderData);

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
        mechOrder: orderData.no === null,
        orderId: orderData.no || orderData.nc12,
        operationNo: operationNo,
        orderData: orderData,
        workerCount: 0,
        quantityDone: 0,
        creator: user.getInfo(),
        startedAt: time.getMoment().toDate(),
        finishedAt: null
      });

      this.generateId(prodShift);
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
        quantityDone: 0,
        creator: user.getInfo(),
        startedAt: time.getMoment().toDate(),
        finishedAt: null
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

    hasOrderData: function()
    {
      return !!this.get('orderId') && !!this.get('operationNo') && !!this.get('orderData');
    },

    finish: function()
    {
      if (!this.id || this.get('finishedAt') != null)
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
      var operations = {};

      if (Array.isArray(orderData.operations))
      {
        orderData.operations.forEach(function(operation)
        {
          operations[operation.no] = operation;
        });
      }
      else if (_.isObject(orderData.operations))
      {
        operations = orderData.operations;
      }

      orderData.operations = operations;

      return orderData;
    }

  });

});
