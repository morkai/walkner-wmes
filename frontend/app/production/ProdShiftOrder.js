define([
  'underscore',
  'moment',
  '../user',
  '../time',
  '../data/prodLog',
  '../core/Model',
  './util/getShiftEndDate'
], function(
  _,
  moment,
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

    defaults: {
      prodShift: null,
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

      this.set({
        prodShift: prodShift.id,
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
        startedAt: time.getServerMoment().toDate(),
        finishedAt: null
      });

      this.generateId(prodShift);
    },

    onOrderContinued: function(prodShift)
    {
      this.set({
        prodShift: prodShift.id,
        prodLine: prodShift.prodLine.id,
        date: prodShift.get('date'),
        shift: prodShift.get('shift'),
        workerCount: 0,
        quantityDone: 0,
        creator: user.getInfo(),
        startedAt: time.getServerMoment().toDate(),
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

      var finishedAt = time.getServerMoment().toDate();
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
    }

  });

});
