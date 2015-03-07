// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/prodLog',
  './NewOrderPickerView',
  './DowntimePickerView',
  './EndWorkDialogView',
  'app/production/templates/data',
  'app/production/templates/endDowntimeDialog',
  'app/production/templates/continueOrderDialog'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  DialogView,
  prodLog,
  NewOrderPickerView,
  DowntimePickerView,
  EndWorkDialogView,
  dataTemplate,
  endDowntimeDialogTemplate,
  continueOrderDialogTemplate
) {
  'use strict';

  return View.extend({

    template: dataTemplate,

    localTopics: {
      'socket.connected': 'fillOrderData'
    },

    events: {
      'click .production-newOrder': 'newOrder',
      'click .production-continueOrder': 'continueOrder',
      'click .production-startDowntime': 'startDowntime',
      'click .production-startBreak': 'startBreak',
      'click .production-endDowntime': 'endDowntime',
      'click .production-endWork': 'endWork',
      'click .production-property-orderNo .btn-link': 'correctOrder',
      'click .production-property-nc12 .btn-link': 'correctOrder',
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

      this.listenTo(order, 'change:_id change:orderId change:operationNo', _.debounce(function()
      {
        this.updateOrderData();
        this.updateOrderInfo();
        this.updateWorkerCount();
        this.updateTaktTime();
      }, 1));
      this.listenTo(order, 'change:quantityDone', this.updateQuantityDone);
      this.listenTo(order, 'change:workerCount', _.debounce(function()
      {
        this.updateWorkerCount();
        this.updateTaktTime();
      }, 1));
    },

    afterRender: function()
    {
      this.$actions = this.$('.production-actions');

      this.updateOrderData();
      this.updateOrderInfo();
      this.updateQuantityDone();
      this.toggleActions();

      if (this.socket.isConnected())
      {
        this.fillOrderData();
      }
    },

    updateOrderInfo: function()
    {
      var order = this.model.prodShiftOrder;

      this.updateOrderNo();
      this.updateNc12();
      this.$property('productName').text(order.getProductName());
      this.$property('operationName').text(order.getOperationName());
    },

    updateOrderData: function()
    {
      this.$el.toggleClass('has-order', this.model.hasOrder());

      this.updateTaktTime();
      this.updateWorkerCount();

      this.$property('startedAt').text(this.model.prodShiftOrder.getStartedAt());
    },

    updateOrderNo: function()
    {
      var html = this.model.prodShiftOrder.getOrderNo();

      if (!this.model.isLocked()
        && this.model.hasOrder()
        && !this.model.prodShiftOrder.isMechOrder())
      {
        html += ' <button class="btn btn-link">'
          + t('production', 'property:orderNo:change')
          + '</button>';
      }

      this.$property('orderNo').html(html);
    },

    updateNc12: function()
    {
      var html = this.model.prodShiftOrder.getNc12();

      if (!this.model.isLocked()
        && this.model.hasOrder()
        && this.model.prodShiftOrder.isMechOrder())
      {
        html += ' <button class="btn btn-link">'
          + t('production', 'property:nc12:change')
          + '</button>';
      }

      this.$property('nc12').html(html);
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
          /*
          view.appendAction('danger', 'startDowntime');

          if (view.model.getDefaultAor())
          {
            view.appendAction('danger', 'startBreak');
          }
          */

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

      if (this.model.getDefaultAor())
      {
        this.appendAction('danger', 'startBreak');
      }

      this.appendAction('success', 'newOrder');
      this.appendAction('warning', 'endWork');
    },

    toggleDowntimeActions: function()
    {
      if (this.model.hasOrder())
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

    newOrder: function(e)
    {
      if (e)
      {
        e.target.blur();
      }

      viewport.showDialog(
        new NewOrderPickerView({model: this.model}),
        t('production', 'newOrderPicker:title' + (this.model.hasOrder() ? ':replacing' : ''))
      );
    },

    continueOrder: function(e)
    {
      if (e)
      {
        e.target.blur();
      }

      var dialogView = new DialogView({
        dialogClassName: 'production-modal',
        template: continueOrderDialogTemplate
      });

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.model.continueOrder();
        }
      });

      viewport.showDialog(dialogView, t('production', 'continueOrderDialog:title'));
    },

    correctOrder: function(e)
    {
      if (e)
      {
        e.target.blur();
      }

      viewport.showDialog(
        new NewOrderPickerView({model: this.model, correctingOrder: true}),
        t('production', 'newOrderPicker:title:correcting')
      );
    },

    startDowntime: function(e, options)
    {
      var startedAt = time.getMoment().toDate();

      if (e)
      {
        e.target.blur();
      }

      if (!options)
      {
        options = {};
      }

      options.model = _.defaults(options.model || {}, {
        mode: 'start',
        prodShift: this.model,
        startedAt: startedAt,
        reason: null,
        aor: null,
        reasonComment: null
      });

      var downtimePickerView = new DowntimePickerView(options);

      this.listenTo(downtimePickerView, 'downtimePicked', function(downtimeInfo)
      {
        viewport.closeDialog();

        this.model.startDowntime(downtimeInfo);
      });

      viewport.showDialog(downtimePickerView, t('production', 'downtimePicker:title:start'));
    },

    startBreak: function(e)
    {
      this.startDowntime(e, {
        model: {
          prodShift: this.model,
          reason: this.model.getBreakReason(),
          aor: this.model.getDefaultAor()
        }
      });
    },

    endDowntime: function(e)
    {
      if (e)
      {
        e.target.blur();
      }

      var dialogView = new DialogView({
        dialogClassName: 'production-modal',
        template: endDowntimeDialogTemplate,
        model: {
          yesSeverity: this.model.hasOrder() ? 'success' : 'warning'
        }
      });

      this.listenTo(dialogView, 'answered', function(answer)
      {
        if (answer === 'yes')
        {
          this.model.endDowntime();
        }
      });

      viewport.showDialog(dialogView, t('production', 'endDowntimeDialog:title'));
    },

    endWork: function(e)
    {
      if (e)
      {
        e.target.blur();
      }

      viewport.showDialog(
        new EndWorkDialogView({model: this.model}),
        t('production', 'endWorkDialog:title')
      );
    },

    showEditor: function($property, oldValue, minValue, maxValue, changeFunction)
    {
      var $value = $property.find('.production-property-value');
      var view = this;
      var $form = $('<form></form>').submit(function() { hideAndSave(); return false; });
      var $input = $('<input class="form-control input-lg" type="number">')
        .val(oldValue)
        .attr('min', minValue)
        .attr('max', maxValue)
        .on('keydown', function(e)
        {
          if (e.which === 27)
          {
            _.defer(hide);
          }
        }).
        css({
          position: 'absolute',
          width: $value.width() + 'px'
        })
        .appendTo($form);

      $form.appendTo($value);

      _.defer(function()
      {
        $input.select().on('blur', function() { _.defer(hideAndSave); });
      });

      function hide()
      {
        $input.remove();
      }

      function hideAndSave()
      {
        var newValue = parseInt($input.val(), 10);

        hide();

        if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue)
        {
          view.model[changeFunction](newValue);
        }
      }
    },

    showQuantityDoneEditor: function()
    {
      this.showEditor(
        this.$('.production-property-quantityDone'),
        this.model.prodShiftOrder.getQuantityDone(),
        0,
        this.model.prodShiftOrder.getMaxQuantityDone(),
        'changeQuantityDone'
      );
    },

    showWorkerCountEditor: function()
    {
      this.showEditor(
        this.$('.production-property-workerCount'),
        this.model.prodShiftOrder.getWorkerCountForEdit(),
        1,
        this.model.prodShiftOrder.getMaxWorkerCount(),
        'changeWorkerCount'
      );
    },

    fillOrderData: function()
    {
      var orderId = this.model.prodShiftOrder.get('orderId');
      var orderData = this.model.prodShiftOrder.get('orderData');

      if (orderId && (!orderData || _.isEmpty(orderData.operations)))
      {
        if (prodLog.isSyncing())
        {
          return this.broker
            .subscribe('production.synced', this.fillOrderData.bind(this))
            .setLimit(1);
        }

        this.fetchOrderData();
      }
    },

    fetchOrderData: function()
    {
      var view = this;
      var model = this.model;
      var searchProperty = model.prodShiftOrder.get('mechOrder') ? 'nc12' : 'no';
      var orderId = model.prodShiftOrder.get('orderId');

      var req = $.ajax({
        type: 'GET',
        url: '/production/orders?' + searchProperty + '=' + encodeURIComponent(orderId)
      });

      this.promised(req).then(function(orders)
      {
        if (!Array.isArray(orders) || !orders.length)
        {
          return;
        }

        var orderData = orders[0];

        if (searchProperty === 'no')
        {
          orderData.no = orderData._id;
        }
        else
        {
          orderData.nc12 = orderData._id;
          orderData.no = null;
        }

        delete orderData._id;

        model.prodShiftOrder.set('orderData', model.prodShiftOrder.prepareOperations(orderData));
        model.saveLocalData();

        view.updateOrderData();
        view.updateOrderInfo();
      });
    }

  });
});
