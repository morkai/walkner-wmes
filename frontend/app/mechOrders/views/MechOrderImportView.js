define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/mechOrders/templates/import'
], function(
  $,
  _,
  t,
  viewport,
  View,
  importTemplate
) {
  'use strict';

  return View.extend({

    template: importTemplate,

    events: {
      'submit': 'upload'
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('mechOrderImport');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
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

      var req = $.ajax({
        type: 'POST',
        url: '/mechOrders;import',
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
          text: t('mechOrders', 'import:msg:success')
        });

        closeDialog();
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('mechOrders', 'import:msg:failure')
        });
      });

      req.always(function()
      {
        $submit.attr('disabled', false);
      });
    }

  });
});
