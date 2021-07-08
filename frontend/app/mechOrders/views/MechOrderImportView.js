// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/mechOrders/templates/import'
], function(
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'mechOrders',

    events: {
      'submit': 'upload'
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    upload: function(e)
    {
      e.preventDefault();

      const $submit = this.$('[type="submit"]').attr('disabled', true);

      const req = this.ajax({
        type: 'POST',
        url: '/mechOrders;import',
        data: new FormData(this.el),
        processData: false,
        contentType: false
      });

      req.then(() =>
      {
        viewport.msg.show({
          type: 'info',
          time: 2500,
          text: this.t('import:msg:success')
        });

        this.closeDialog();
      });

      req.fail(() =>
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: this.t('import:msg:failure')
        });
      });

      req.always(() =>
      {
        $submit.attr('disabled', false);
      });
    }

  });
});
