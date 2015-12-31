// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/reports/templates/9/planUpload'
], function(
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

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

      var $submit = this.$('[type=submit]').attr('disabled', true);

      var formData = new FormData(this.el);

      var req = this.ajax({
        type: 'POST',
        url: '/cags;importPlan',
        data: formData,
        processData: false,
        contentType: false
      });

      var closeDialog = this.closeDialog;

      req.then(function()
      {
        viewport.msg.show({
          type: 'info',
          time: 2500,
          text: t('reports', '9:planUpload:success')
        });

        closeDialog();
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('reports', '9:planUpload:failure')
        });
      });

      req.always(function()
      {
        $submit.attr('disabled', false);
      });
    }

  });
});
