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
        var newWorkerCount = this.parseInt('workerCount');

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
    },

    serialize: function()
    {
      var shift = this.model;
      var order = shift.prodShiftOrder;

      return {
        idPrefix: this.idPrefix,
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
