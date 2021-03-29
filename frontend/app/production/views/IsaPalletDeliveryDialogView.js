// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/data/localStorage',
  'app/data/isaPalletKinds',
  'app/production/templates/isaPalletDeliveryDialog'
], function(
  t,
  View,
  localStorage,
  palletKinds,
  template
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:ISA:LAST_DELIVERY';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    nlsDomain: 'production',

    events: {
      'input #-qty': 'checkQtyValidity',
      'click .btn[data-id]': function(e)
      {
        this.$id('palletKind').find('.active').removeClass('active');
        this.$(e.currentTarget).addClass('active').blur();

        this.toggleSubmit();
      },
      'submit': function(e)
      {
        e.preventDefault();

        var palletKind = this.$id('palletKind').find('.active').attr('data-id');
        var qty = +this.$id('qty').val();

        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          palletKind: palletKind,
          qty: qty
        }));

        this.trigger('picked', palletKind, qty);
      }
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      return {
        palletKinds: palletKinds.map(function(palletKind)
        {
          return {
            id: palletKind.id,
            text: palletKind.get('fullName')
          };
        })
      };
    },

    afterRender: function()
    {
      if (this.options.embedded)
      {
        this.options.vkb.show(
          this.$id('qty').addClass('is-embedded')[0],
          this.onVkbValueChange.bind(this)
        );
      }

      var lastDelivery = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      this.$id('qty').val(lastDelivery.qty || 8);
      this.$id('palletKind').find('.btn[data-id="' + lastDelivery.palletKind + '"]').click();

      this.checkQtyValidity();
    },

    toggleSubmit: function()
    {
      this.$id('submit').prop('disabled', !this.$id('palletKind').find('.active').length);
    },

    checkQtyValidity: function()
    {
      var $qty = this.$id('qty');
      var qty = $qty.val().replace(/[^0-9]+/g, '') || 0;
      var min = 1;
      var max = 9;
      var error = '';

      if (qty < min)
      {
        error = t('production', 'error:min', {min: min});
      }
      else if (qty > max)
      {
        error = t('production', 'error:max', {max: max});
      }

      $qty.val(qty || '')[0].setCustomValidity(error);

      this.toggleSubmit();
    },

    onVkbValueChange: function()
    {
      this.checkQtyValidity();
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('qty').focus();
    },

    closeDialog: function() {}

  });
});
