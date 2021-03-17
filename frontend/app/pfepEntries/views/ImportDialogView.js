// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/pfepEntries/templates/importDialog'
], function(
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

    nlsDomain: 'pfepEntries',

    getTemplateData: function()
    {
      return {};
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    upload: function(e)
    {
      e.preventDefault();

      var view = this;
      var $submit = view.$('[type="submit"]').attr('disabled', true);
      var $msg = viewport.msg.show({
        type: 'warning',
        text: view.t('core', 'MSG:IMPORTING')
      });

      var req = view.ajax({
        type: 'POST',
        url: '/pfep/entries;import',
        data: new FormData(view.el),
        processData: false,
        contentType: false
      });

      req.always(function()
      {
        viewport.msg.hide($msg);
      });

      req.done(function()
      {
        view.closeDialog();
      });

      req.fail(function()
      {
        $submit.attr('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('core', 'MSG:IMPORTING_FAILURE')
        });
      });
    }

  });
});
