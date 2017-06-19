// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orderDocumentTree/templates/removeFilesDialog'
], function(
  _,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        var $submit = this.$id('submit').prop('disabled', true);
        var $spinner = $submit.find('.fa-spinner').removeClass('hidden');
        var model = this.model;
        var req = model.purge
          ? model.tree.purgeFiles(model.files, model.folder)
          : model.tree.removeFiles(model.files);

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('orderDocumentTree', 'removeFiles:msg:failure')
          });
        });

        req.done(function()
        {
          viewport.msg.show({
            type: 'success',
            time: 2000,
            text: t('orderDocumentTree', 'removeFiles:msg:success')
          });
        });

        req.done(this.closeDialog);

        req.always(function()
        {
          $spinner.addClass('hidden');
          $submit.prop('disabled', false);
        });

        return false;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        purge: this.model.purge
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function()
    {

    }

  });
});
