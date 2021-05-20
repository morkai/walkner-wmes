// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../util/limitQuantityDone',
  'app/production/templates/endWorkDialog'
], function(
  $,
  t,
  View,
  limitQuantityDone,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    remoteTopics: function()
    {
      var topics = {};

      topics['production.spigotCheck.scanned.' + this.model.prodLine.id] = 'onSpigotScanned';

      return topics;
    },

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'focus #-spigot-nc12': function()
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.hide();
        }
      },
      'input input[type="text"][max]': 'checkMinMaxValidity',
      'blur input[type="text"][max]': 'checkMinMaxValidity',
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$('.btn-warning')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var $nc12 = this.$id('spigot-nc12');

        if ($nc12.length)
        {
          var matches = $nc12.val().match(/([0-9]{12})/);
          var nc12 = matches ? matches[1] : '';

          if (!nc12.length || !this.model.checkSpigot(null, nc12))
          {
            $nc12[0].setCustomValidity(t('production', 'endWorkDialog:spigot:invalid'));

            this.timers.submit = setTimeout(
              function()
              {
                submitEl.disabled = false;
                submitEl.click();
              },
              1,
              this
            );

            return;
          }
        }

        if (this.ft.checkCredentials)
        {
          return this.ft.checkCredentials();
        }

        var newQuantitiesDone = this.parseInt('quantitiesDone');
        var newQuantityDone = this.parseInt('quantityDone');
        var newWorkerCount = this.parseFloat('workerCount');

        this.model.changeCurrentQuantitiesDone(newQuantitiesDone);

        if (newQuantityDone !== this.model.prodShiftOrder.get('quantityDone'))
        {
          this.model.changeQuantityDone(newQuantityDone);
        }

        if (newWorkerCount !== this.model.prodShiftOrder.get('workerCount'))
        {
          this.model.changeWorkerCount(newWorkerCount);
        }

        this.model.endWork();

        this.closeDialog();
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.lastKeyPressAt = 0;

      this.listenTo(this.model.prodShiftOrder, 'qtyMaxChanged', this.limitQuantityDone);

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keypress.' + this.idPrefix, this.onKeyPress.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }

      if (this.$id('spigot-nc12').length)
      {
        this.pubsub.publish('production.spigotCheck.aborted.' + this.model.prodLine.id, {
          prodLineId: this.model.prodLine.id
        });
      }
    },

    getTemplateData: function()
    {
      var shift = this.model;
      var order = shift.prodShiftOrder;

      return {
        spigot: shift.settings.getValue('spigotFinish') && !!order.get('spigot'),
        downtime: shift.isDowntime(),
        hourRange: shift.getCurrentQuantityDoneHourRange(),
        quantitiesDone: shift.getQuantityDoneInCurrentHour(),
        quantityDone: order.get('quantityDone') || 0,
        workerCount: order.getWorkerCountForEdit(),
        maxQuantitiesDone: shift.getMaxQuantitiesDone(),
        maxQuantityDone: order.getMaxQuantityDone(),
        maxWorkerCount: order.getMaxWorkerCount(),
        embedded: this.options.embedded
      };
    },

    afterRender: function()
    {
      this.limitQuantityDone();
      this.notifySpigotCheckRequest();

      /*
      if (this.model.isTaktTimeEnabled())
      {
        this.$id('quantitiesDone').prop('disabled', true);
        this.$id('quantityDone').prop('disabled', true);
      }
      */

      this.focusFirstInput();
    },

    focusFirstInput: function()
    {
      this.$('input:not([disabled])').select();
    },

    notifySpigotCheckRequest: function()
    {
      if (!this.$id('spigot-nc12').length)
      {
        return;
      }

      clearTimeout(this.timers.notifySpigotCheckRequest);
      this.timers.notifySpigotCheckRequest = setTimeout(this.notifySpigotCheckRequest.bind(this), 5000);

      this.pubsub.publish('production.spigotCheck.requested.' + this.model.prodLine.id, {
        prodLine: this.model.prodLine.id,
        component: this.model.prodShiftOrder.get('spigot').component,
        orderNo: this.model.prodShiftOrder.get('orderId'),
        source: 'endWork'
      });
    },

    onSpigotScanned: function(message)
    {
      var $spigot = this.$id('spigot-nc12').val(message.nc12);

      if (!$spigot.length)
      {
        return;
      }

      $spigot[0].setCustomValidity('');

      var prodLineId = this.model.prodLine.id;
      var pso = this.model.prodShiftOrder;
      var spigot = pso.get('spigot');

      if (!spigot)
      {
        return;
      }

      if (this.model.checkSpigotValidity(message.nc12, spigot.component.nc12))
      {
        this.pubsub.publish('production.spigotCheck.success.' + prodLineId, {
          prodLine: prodLineId,
          component: spigot.component,
          orderNo: pso.get('orderId'),
          input: message.nc12,
          nc12: spigot.component.nc12,
          source: 'endWork'
        });
      }
      else
      {
        this.pubsub.publish('production.spigotCheck.failure.' + prodLineId, {
          prodLine: prodLineId,
          component: spigot.component,
          orderNo: pso.get('orderId'),
          input: message.nc12,
          source: 'endWork'
        });
      }
    },

    limitQuantityDone: function()
    {
      limitQuantityDone(this, this.model.prodShiftOrder);
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    parseFloat: function(field)
    {
      var value = Math.round(parseFloat(this.$id(field).val().replace(',', '.')) * 10) / 10;

      return isNaN(value) || value < 0 ? 0 : value;
    },

    parseInt: function(field)
    {
      var value = parseInt(this.$id(field).val(), 10);

      return isNaN(value) || value < 0 ? 0 : value;
    },

    isIgnoredTarget: function(target)
    {
      return target.type === 'number'
        || target.className.indexOf('select2') !== -1
        || target.dataset.ignoreKey === '1';
    },

    onVkbValueChange: function(fieldEl)
    {
      this.checkMinMaxValidity({target: fieldEl});
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 8 && !this.isIgnoredTarget(e.target))
      {
        this.lastKeyPressAt = Date.now();

        var $nc12 = this.$id('spigot-nc12');

        if ($nc12.length)
        {
          $nc12.val('')[0].setCustomValidity('');
        }

        return false;
      }
    },

    onKeyPress: function(e)
    {
      var $nc12 = this.$id('spigot-nc12');

      if (!$nc12.length)
      {
        return;
      }

      if (e.keyCode === 13)
      {
        return $nc12[0] !== e.target;
      }

      if (e.keyCode < 32 || e.keyCode > 126 || this.isIgnoredTarget(e.target))
      {
        return;
      }

      var keyPressAt = Date.now();
      var prevValue = keyPressAt - this.lastKeyPressAt > 333 ? '' : $nc12.val();
      var key = String.fromCharCode(e.keyCode);

      $nc12.val(prevValue + key)[0].setCustomValidity('');
      $nc12.focus();

      this.lastKeyPressAt = keyPressAt;

      return false;
    },

    checkMinMaxValidity: function(e)
    {
      var el = e.target;
      var max = parseInt(el.getAttribute('max'), 10);

      if (isNaN(max))
      {
        return;
      }

      var min = parseInt(el.getAttribute('min'), 10) || 0;
      var val = parseInt(el.value, 10) || 0;
      var err = '';

      if (val < min)
      {
        err = t('production', 'error:min', {min: min});
      }
      else if (val > max)
      {
        err = t('production', 'error:max', {max: max});
      }

      el.setCustomValidity(err);
    }

  });
});
