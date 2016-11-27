// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      'click #-orderNo': 'correctOrder',
      'click #-nc12': 'correctOrder',
      'click #-quantityDone': 'showQuantityDoneEditor',
      'click #-workerCount': 'showWorkerCountEditor'
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
      }, 1));
      this.listenTo(order, 'change:quantityDone', _.debounce(function()
      {
        this.updateQuantityDone();
        this.updateTaktTime();
      }, 1));
      this.listenTo(order, 'change:workerCount', _.debounce(function()
      {
        this.updateTaktTime();
        this.updateWorkerCount();
      }, 1));

      this.listenTo(this.model.settings, 'reset change', function(setting)
      {
        if (!setting || /taktTime/.test(setting.id))
        {
          this.updateQuantityDone();
          this.updateTaktTime();
        }
      });
    },

    destroy: function()
    {
      document.body.classList.remove('is-tt-ok', 'is-tt-nok');
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

      this.$property('createdAt').text(this.model.prodShiftOrder.getStartedAt());
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
      var model = this.model;
      var enabled = model.isTaktTimeEnabled();
      var showLast = model.settings.showLastTaktTime();
      var showAvg = model.settings.showAvgTaktTime();
      var showSap = model.settings.showSapTaktTime();
      var pso = model.prodShiftOrder;
      var $lastTaktTime = this.$property('lastTaktTime');
      var $avgTaktTime = this.$property('avgTaktTime');
      var $sapTaktTime = this.$property('taktTime');
      var avgTaktTime = Math.round((pso.get('avgTaktTime') || 0) / 1000);
      var lastTaktTime = Math.round((pso.get('lastTaktTime') || 0) / 1000);
      var sapTaktTime = pso.getTaktTime();
      var text = '';

      if (enabled && showLast && lastTaktTime)
      {
        text = lastTaktTime;

        $lastTaktTime.parent().removeClass('is-tt-sap').addClass('is-tt-last');
      }
      else
      {
        text = sapTaktTime;

        $lastTaktTime.parent().addClass('is-tt-sap').removeClass('is-tt-last');
      }

      $sapTaktTime
        .text(sapTaktTime)
        .parent()
        .toggleClass('hidden', !showSap);

      $lastTaktTime
        .text(text)
        .parent()
        .toggleClass('hidden', !showLast);

      $avgTaktTime
        .text(avgTaktTime || '?')
        .parent()
        .toggleClass('hidden', !enabled || !showAvg || !(pso.get('quantityDone') > 1 && avgTaktTime > 0))
        .removeClass('is-ok is-nok')
        .addClass(avgTaktTime <= sapTaktTime ? 'is-ok' : 'is-nok');

      document.body.classList.remove('is-tt-ok', 'is-tt-nok');

      if (enabled && lastTaktTime && sapTaktTime)
      {
        document.body.classList.add(lastTaktTime <= sapTaktTime ? 'is-tt-ok' : 'is-tt-nok');
      }
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

        if (!this.model.isLocked() && !this.model.isTaktTimeEnabled())
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

      if (viewport.currentDialog)
      {
        return;
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

      if (viewport.currentDialog)
      {
        return;
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

      if (viewport.currentDialog || this.model.get('state') === 'idle')
      {
        return;
      }

      viewport.showDialog(
        new NewOrderPickerView({model: this.model, correctingOrder: true}),
        t('production', 'newOrderPicker:title:correcting')
      );
    },

    startDowntime: function(e, options)
    {
      if (e)
      {
        e.target.blur();
      }

      if (viewport.currentDialog)
      {
        return;
      }

      if (!options)
      {
        options = {};
      }

      options.model = _.defaults(options.model || {}, {
        mode: 'start',
        prodShift: this.model,
        startedAt: time.getMoment().toDate(),
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

      if (viewport.currentDialog)
      {
        return;
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

      if (viewport.currentDialog)
      {
        return;
      }

      viewport.showDialog(
        new EndWorkDialogView({model: this.model}),
        t('production', 'endWorkDialog:title')
      );
    },

    showEditor: function($property, oldValue, minValue, maxValue, changeFunction)
    {
      if (!$property.find('.btn').length)
      {
        return;
      }

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
        $form.remove();
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
