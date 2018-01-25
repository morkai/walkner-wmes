// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
  Model
) {
  'use strict';

  var ICONS = {
    small: 'fa-star-o',
    easy: 'fa-star-half-full',
    hard: 'fa-star',
    unclassified: 'fa-question-mark',
    late: 'fa-hourglass-end',
    added: 'fa-plus',
    incomplete: 'fa-arrow-right',
    urgent: 'fa-exclamation',
    pinned: 'fa-thumb-tack',
    ignored: 'fa-ban',
    psStatus: 'fa-paint-brush',
    whStatus: 'fa-truck'
  };

  return Model.extend({

    getActualOrderData: function()
    {
      return this.pick(['quantityTodo', 'quantityDone', 'statuses']);
    },

    isAutoAdded: function()
    {
      return this.attributes.source === 'incomplete' || this.attributes.source === 'late';
    },

    isPinned: function()
    {
      return !_.isEmpty(this.attributes.lines);
    },

    hasCustomQuantity: function()
    {
      return this.attributes.quantityPlan > 0 && this.attributes.source !== 'incomplete';
    },

    getManHours: function(quantity)
    {
      if (quantity === undefined)
      {
        quantity = this.getQuantityTodo();
      }

      var operation = this.attributes.operation;
      var schedulingRate = this.collection ? this.collection.plan.settings.getSchedulingRate(this.attributes.mrp) : 1;

      return operation.laborTime
        ? (((operation.laborTime / 100 * quantity) + operation.laborSetupTime) * schedulingRate)
        : 0;
    },

    getQuantityTodo: function()
    {
      var quantityPlan = this.get('quantityPlan');

      if (quantityPlan > 0)
      {
        return quantityPlan;
      }

      if (!this.collection || this.collection.plan.settings.attributes.useRemainingQuantity)
      {
        return Math.max(0, this.get('quantityTodo') - this.get('quantityDone'));
      }

      return this.get('quantityTodo');
    },

    getKindIcon: function()
    {
      return this.getIcon(this.attributes.kind);
    },

    getSourceIcon: function()
    {
      return this.getIcon(this.attributes.source);
    },

    getIcon: function(icon)
    {
      return ICONS[icon] || '';
    },

    getStatus: function()
    {
      var orderData = this.collection.plan.getActualOrderData(this.id);

      if (orderData.quantityDone > orderData.quantityTodo)
      {
        return 'surplus';
      }

      if (orderData.quantityDone === orderData.quantityTodo)
      {
        return 'completed';
      }

      if (this.attributes.incomplete === this.getQuantityTodo())
      {
        return 'unplanned';
      }

      if (this.attributes.incomplete > 0)
      {
        return 'incomplete';
      }

      if (orderData.quantityDone > 0)
      {
        return 'started';
      }

      return 'planned';
    }

  });
});
