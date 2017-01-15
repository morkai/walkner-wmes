// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../production/util/orderPickerHelpers',
  '../orderStatuses/util/renderOrderStatusLabel',
  '../orders/util/resolveProductName'
], function(
  _,
  Model,
  orderPickerHelpers,
  renderOrderStatusLabel,
  resolveProductName
) {
  'use strict';

  return Model.extend({

    serializeListItem: function()
    {
      return {
        _id: this.id,
        completed: this.isCompleted(),
        confirmed: this.isConfirmed(),
        delivered: this.isDelivered(),
        invalid: !this.isValid()
      };
    },

    serializePopover: function()
    {
      return _.assign(this.toJSON(), {
        plan: this.collection.plan.id,
        completed: this.isCompleted(),
        statuses: (this.get('statuses') || []).map(renderOrderStatusLabel)
      });
    },

    isValid: function()
    {
      return this.isValidOperation();
    },

    isValidOperation: function()
    {
      var operation = this.get('operation');

      return operation && operation.laborTime > 0;
    },

    isCompleted: function()
    {
      return this.get('qtyDone') >= this.get('qtyTodo');
    },

    isConfirmed: function()
    {
      return this.hasStatus('CNF');
    },

    isDelivered: function()
    {
      return this.hasStatus('DLV');
    },

    hasStatus: function(status)
    {
      return _.includes(this.get('statuses'), status);
    },

    getPceTime: function(workerCount)
    {
      var operation = this.get('operation');

      if (!operation || !operation.laborTime || !workerCount)
      {
        return 0;
      }

      return Math.floor(operation.laborTime / workerCount / 100 * 3600 * 1000);
    },

    setOperation: function(newOperation)
    {
      this.collection.plan.collection.update('updateOrder', this.collection.plan.id, {
        _id: this.id,
        operation: this.constructor.prepareOperation(newOperation)
      });
    }

  }, {

    prepareOperation: function(operation)
    {
      return !operation ? null : _.pick(operation, [
        'no', 'workCenter', 'name', 'qty', 'machineTime', 'laborTime'
      ]);
    },

    prepareFromSapOrder: function(sapOrder)
    {
      return {
        _id: sapOrder._id,
        nc12: sapOrder.nc12 || '',
        name: resolveProductName(sapOrder),
        qtyTodo: sapOrder.qty || 0,
        qtyDone: sapOrder.qtyDone && sapOrder.qtyDone.total ? sapOrder.qtyDone.total : 0,
        statuses: sapOrder.statuses || [],
        operation: this.prepareOperation(orderPickerHelpers.getBestDefaultOperation(sapOrder.operations))
      };
    },

    prepareFromMrpOrder: function(mrpOrder)
    {
      return {
        _id: mrpOrder._id,
        nc12: mrpOrder.nc12 || '',
        name: mrpOrder.name || '',
        qtyTodo: mrpOrder.qty || 0,
        qtyDone: 0,
        statuses: [],
        operation: null
      };
    },

    ORDER_PROPERTIES: ['_id', 'nc12', 'name', 'description', 'qty', 'qtyDone.total', 'statuses', 'operations']

  });

});
