// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/data/orderStatuses',
  'app/core/View',
  './OperationListView',
  '../Order',
  '../OperationCollection',
  'app/orders/templates/changes',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  _,
  time,
  t,
  viewport,
  orderStatuses,
  View,
  OperationListView,
  Order,
  OperationCollection,
  changesTemplate,
  renderOrderStatusLabel
) {
  'use strict';

  return View.extend({

    template: changesTemplate,

    events: {
      'click .orders-changes-more': 'showMoreChanges',
      'click .orders-changes-operations': 'toggleOperations'
    },

    initialize: function()
    {
      this.$lastToggle = null;

      this.operationListView = null;
    },

    destroy: function()
    {
      if (this.$lastToggle !== null)
      {
        this.$lastToggle.click();
      }
    },

    serialize: function()
    {
      return {
        changes: (this.model.get('changes') || []).reverse().map(function(change)
        {
          change.timeText = time.format(change.time, 'YYYY-MM-DD HH:mm:ss');
          change.values = Object.keys(change.oldValues || {}).map(function(property)
          {
            return {
              property: property,
              oldValue: change.oldValues[property],
              newValue: change.newValues[property]
            };
          });

          return change;
        })
        .filter(function(change)
        {
          return change.values.length;
        }),
        renderValueChange: this.renderValueChange
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:changes', this.render);
    },

    renderValueChange: function(valueChange, i, valueProperty)
    {
      /*jshint -W015*/

      var value = valueChange[valueProperty];

      if (value == null || value.length === 0)
      {
        return '-';
      }

      switch (valueChange.property)
      {
        case 'operations':
          return '<a class="orders-changes-operations" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + t('orders', 'CHANGES:operations', {count: value.length})
            + '</a>';

        case 'statuses':
          return orderStatuses.findAndFill(value).map(renderOrderStatusLabel).join('');

        case 'startDate':
        case 'finishDate':
          return time.format(value, 'LL');

        default:
          return _.escape(String(value));
      }
    },

    showMoreChanges: function()
    {
      var $hiddenPages = this.$('.orders-changes-page.hidden');

      $hiddenPages.first().removeClass('hidden');

      if ($hiddenPages.length === 1)
      {
        this.$('.orders-changes-more').hide();
      }
    },

    toggleOperations: function(e)
    {
      if (this.$lastToggle !== null)
      {
        if (this.$lastToggle[0] === e.target)
        {
          this.$lastToggle = null;

          this.operationListView.remove();

          return;
        }

        this.$lastToggle.click();
      }

      var $lastToggle = this.$(e.target);

      var i = $lastToggle.attr('data-i');
      var property = $lastToggle.attr('data-property') + 's';
      var operations = new OperationCollection(this.model.get('changes')[i][property].operations);
      var operationListView = new OperationListView({model: new Order({operations: operations})});

      var top = $lastToggle.closest('tr')[0].offsetTop + 41 + 31;

      operationListView.render();
      operationListView.$el.css('top', top);

      this.$el.append(operationListView.$el);

      this.$lastToggle = $lastToggle;
      this.operationListView = operationListView;
    }

  });
});
