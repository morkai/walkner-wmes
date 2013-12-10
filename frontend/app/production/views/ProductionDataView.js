define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './NewOrderPickerView',
  './DowntimePickerView',
  'app/production/templates/data'
], function(
  _,
  $,
  t,
  viewport,
  View,
  NewOrderPickerView,
  DowntimePickerView,
  dataTemplate
) {
  'use strict';

  // TODO: Sync missing order data on connect

  return View.extend({

    template: dataTemplate,

    events: {
      'click .production-newOrder': 'showNewOrderDialog',
      'click .production-continueOrder': 'continueOrder',
      'click .production-startDowntime': 'showDowntimePickerDialog',
      'click .production-endDowntime': 'endDowntime',
      'click .production-endWork': 'endWork',
      'click .production-property-quantityDone .btn-link': 'showQuantityDoneEditor',
      'click .production-property-workerCount .btn-link': 'showWorkerCountEditor'
    },

    initialize: function()
    {
      this.listenTo(this.model, 'locked unlocked', function()
      {
        this.updateWorkerCount();
        this.updateQuantityDone();
        this.toggleActions();
      });
      this.listenTo(this.model, 'change:state', this.toggleActions);

      var order = this.model.prodShiftOrder;

      this.listenTo(order, 'change:_id', this.updateOrderData);
      this.listenTo(order, 'change:orderId', this.updateOrderInfo);
      this.listenTo(order, 'change:quantityDone', this.updateQuantityDone);
      this.listenTo(order, 'change:workerCount', function()
      {
        this.updateWorkerCount();
        this.updateTaktTime();
      });
    },

    afterRender: function()
    {
      this.$actions = this.$('.production-actions');

      this.updateOrderData();
      this.updateOrderInfo();
      this.updateWorkerCount();
      this.updateTaktTime();
      this.updateQuantityDone();
      this.toggleActions();
    },

    updateOrderInfo: function()
    {
      var order = this.model.prodShiftOrder;

      this.$property('orderNo').text(order.getOrderNo());
      this.$property('nc12').text(order.getNc12());
      this.$property('productName').text(order.getProductName());
      this.$property('operationName').text(order.getOperationName());
    },

    updateOrderData: function()
    {
      this.toggleOrderDataProperties();

      this.$property('startedAt').text(this.model.prodShiftOrder.getStartedAt());
    },

    toggleOrderDataProperties: function()
    {
      this.$('.production-properties-orderData').toggle(!!this.model.prodShiftOrder.id);
    },

    updateWorkerCount: function()
    {
      this.$property('workerCountSap').text(this.model.prodShiftOrder.getWorkerCountSap());

      var workerCount = this.model.prodShiftOrder.getWorkerCount();
      var html = '';

      if (this.model.isIdle())
      {
        html = '-';
      }
      else if (this.model.isLocked())
      {
        html = typeof workerCount === 'number' ? workerCount : '-';
      }
      else
      {
        var label = 'property:workerCount:change:noData';

        if (workerCount > 0)
        {
          label = 'property:workerCount:change:data';
          html += workerCount + ' ';
        }

        html += '<button class="btn btn-link">' + t('production', label) + '</button>';
      }

      this.$property('workerCount').html(html);
    },

    updateTaktTime: function()
    {
      this.$property('taktTime').text(this.model.prodShiftOrder.getTaktTime());
    },

    updateQuantityDone: function()
    {
      var html;

      if (this.model.isIdle())
      {
        html = '-';
      }
      else
      {
        html = String(this.model.prodShiftOrder.getQuantityDone());

        if (!this.model.isLocked())
        {
          html += ' <button class="btn btn-link">'
            + t('production', 'property:quantityDone:change')
            + '</button>';
        }
      }

      this.$property('quantityDone').html(html);
    },

    toggleActions: function()
    {
      this.$actions.empty();

      if (this.model.isLocked())
      {
        return;
      }

      if (this.model.isIdle())
      {
        this.toggleIdleActions();
      }
      else if (this.model.isWorking())
      {
        this.toggleWorkingActions();
      }
      else
      {
        this.toggleDowntimeActions();
      }
    },

    toggleIdleActions: function()
    {
      _.defer(
        function(view)
        {
          view.appendAction('danger', 'startDowntime');

          if (view.model.prodShiftOrder.hasOrderData())
          {
            view.appendAction('success', 'continueOrder');
          }

          view.appendAction('success', 'newOrder');
        },
        this
      );
    },

    toggleWorkingActions: function()
    {
      this.appendAction('danger', 'startDowntime');
      this.appendAction('success', 'newOrder');
      this.appendAction('warning', 'endWork');
    },

    toggleDowntimeActions: function()
    {
      if (this.model.prodShiftOrder.id)
      {
        this.appendAction('success', 'endDowntime');
        this.appendAction('warning', 'endWork');
      }
      else
      {
        this.appendAction('warning', 'endDowntime');
      }
    },

    appendAction: function(severity, action)
    {
      var classNames = [
        'btn',
        'btn-' + severity,
        'production-action',
        'production-' + action
      ];
      var label = t('production', 'action:' + action);

      this.$actions.append('<button class="' + classNames.join(' ') + '">' + label + '</button>');
    },

    $property: function(propertyName)
    {
      return this.$('.production-property-' + propertyName + ' .production-property-value');
    },

    showNewOrderDialog: function()
    {
      var newOrderView = new NewOrderPickerView();

      this.listenTo(newOrderView, 'orderPicked', function(orderInfo, operationNo)
      {
        viewport.closeDialog();

        this.model.changeOrder(orderInfo, operationNo);
      });

      viewport.showDialog(newOrderView, t('production', 'newOrderPicker:title'));
    },

    continueOrder: function()
    {
      this.model.continueOrder();
    },

    showDowntimePickerDialog: function()
    {
      var downtimePickerView = new DowntimePickerView();

      this.listenTo(downtimePickerView, 'downtimePicked', function(downtimeInfo)
      {
        viewport.closeDialog();

        this.model.startDowntime(downtimeInfo);
      });

      viewport.showDialog(downtimePickerView, t('production', 'downtimePicker:title'));
    },

    endDowntime: function()
    {
      this.model.endDowntime();
    },

    endWork: function()
    {
      this.model.endWork();
    },

    showEditor: function($property, oldValue, changeFunction)
    {
      var $value = $property.find('.production-property-value');

      var view = this;
      var $input = $('<input class="form-control input-lg" type="number" min="0">')
        .val(oldValue)
        .on('blur', hideAndSave)
        .on('keydown', function(e)
        {
          if (e.which === 27)
          {
            setTimeout(hide, 1);
          }
          else if (e.which === 13)
          {
            setTimeout(hideAndSave, 1);
          }
        }).
        css({
          position: 'absolute',
          width: $value.width() + 'px'
        })
        .appendTo($value)
        .select();

      function hide()
      {
        $input.remove();
      }

      function hideAndSave()
      {
        var newValue = parseInt($input.val(), 10);

        hide();

        if (newValue !== oldValue && newValue >= 0)
        {
          view.model[changeFunction](newValue);
        }

        _.defer(function() { $property.find('.btn-link').focus(); });
      }
    },

    showQuantityDoneEditor: function()
    {
      this.showEditor(
        this.$('.production-property-quantityDone'),
        this.model.prodShiftOrder.getQuantityDone(),
        'changeQuantityDone'
      );
    },

    showWorkerCountEditor: function()
    {
      this.showEditor(
        this.$('.production-property-workerCount'),
        this.model.prodShiftOrder.getWorkerCount(),
        'changeWorkerCount'
      );
    }

  });
});
