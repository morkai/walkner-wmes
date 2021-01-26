// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/wmes-gft-pcbs/templates/import'
], function(
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-gft-pcbs',

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

      const $submit = this.$('[type=submit]').attr('disabled', true);

      const req = this.ajax({
        type: 'POST',
        url: '/gft/pcbs;import',
        data: new FormData(this.el),
        processData: false,
        contentType: false
      });

      req.done(res =>
      {
        this.closeDialog();

        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: this.t('import:success', {count: res.count})
        });
      });

      req.fail(() =>
      {
        $submit.attr('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: this.t('import:failure')
        });
      });
    }

  });
});
