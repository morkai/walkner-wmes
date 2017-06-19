// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    defaults: {
      ignored: false
    },

    serializeListItem: function()
    {
      return {
        _id: this.id,
        completed: this.isCompleted(),
        confirmed: this.isConfirmed(),
        delivered: this.isDelivered(),
        invalid: !this.isValid(),
        ignored: this.isIgnored(),
        surplus: this.isSurplus(),
        customQty: this.get('qtyPlan') > 0
      };
    },

    serializePopover: function()
    {
      return _.assign(this.toJSON(), {
        plan: this.collection.plan.id,
        completed: this.isCompleted(),
        surplus: this.isSurplus(),
        statuses: (this.get('statuses') || []).map(renderOrderStatusLabel),
        laborTime: this.getLaborTime()
      });
    },

    isSurplus: function()
    {
      return this.get('qtyDone') > this.get('qtyTodo');
    },

    isValid: function()
    {
      return this.isValidLaborTime()
        && this.isValidOperation()
        && this.isValidStatus();
    },

    isValidOperation: function()
    {
      var operation = this.get('operation');

      return operation && operation.laborTime > 0;
    },

    isValidStatus: function()
    {
      var statuses = this.get('statuses');

      return Array.isArray(statuses) && statuses.length > 0;
    },

    isValidLaborTime: function()
    {
      return this.getLaborTime() > 0;
    },

    isIgnored: function()
    {
      return !!this.get('ignored');
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

    getLaborTime: function()
    {
      var rbh = this.get('rbh');

      if (rbh)
      {
        return 100 * rbh / this.get('qtyTodo');
      }

      var operation = this.get('operation');

      return operation && operation.laborTime ? operation.laborTime : 0;
    },

    getPceTime: function(workerCount)
    {
      if (!workerCount)
      {
        return 0;
      }

      var laborTime = this.getLaborTime();

      if (!laborTime)
      {
        return 0;
      }

      return Math.floor(laborTime / workerCount / 100 * 3600 * 1000);
    },

    update: function(data)
    {
      var changes = {
        _id: this.id
      };

      if (data.operation !== undefined)
      {
        changes.operation = this.constructor.prepareOperation(data.operation);
      }

      if (!isNaN(data.qtyPlan) && _.isNumber(data.qtyPlan))
      {
        changes.qtyPlan = Math.max(0, data.qtyPlan);
      }

      if (typeof data.ignored === 'boolean')
      {
        changes.ignored = data.ignored;
      }

      var attrs = this.attributes;

      if (_.some(changes, function(v, k) { return !_.isEqual(attrs[k], v); }))
      {
        this.collection.plan.collection.update('updateOrder', this.collection.plan.id, changes);
      }
    }

  }, {

    prepareOperation: function(operation)
    {
      return !operation ? null : _.pick(operation, [
        'no', 'workCenter', 'name', 'qty', 'machineTime', 'laborTime'
      ]);
    },

    prepareFromSapOrder: function(sapOrder, mrpOrder)
    {
      return {
        _id: sapOrder._id,
        nc12: sapOrder.nc12 || '',
        name: resolveProductName(sapOrder),
        rbh: mrpOrder && mrpOrder.rbh ? mrpOrder.rbh : 0,
        qtyPlan: 0,
        qtyTodo: sapOrder.qty || 0,
        qtyDone: sapOrder.qtyDone && sapOrder.qtyDone.total ? (sapOrder.qtyDone.total || 0) : 0,
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
        rbh: mrpOrder.rbh || 0,
        qtyPlan: 0,
        qtyTodo: mrpOrder.qty || 0,
        qtyDone: 0,
        statuses: [],
        operation: null
      };
    },

    ORDER_PROPERTIES: ['_id', 'nc12', 'name', 'description', 'qty', 'qtyDone.total', 'statuses', 'operations']

  });

});
