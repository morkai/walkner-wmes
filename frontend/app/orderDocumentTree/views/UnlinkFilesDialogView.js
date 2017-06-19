// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/orderDocumentTree/templates/unlinkFilesDialog'
], function(
  _,
  $,
  t,
  time,
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

        var req = this.model.tree.unlinkFiles(
          this.model.files,
          this.model.folder,
          this.$('input[name="remove"]:checked').val() === '1'
        );

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('orderDocumentTree', 'unlinkFiles:msg:failure')
          });
        });

        req.done(function()
        {
          viewport.msg.show({
            type: 'success',
            time: 2000,
            text: t('orderDocumentTree', 'unlinkFiles:msg:success')
          });
        });

        req.done(viewport.closeDialog);

        req.always(function()
        {
          $spinner.addClass('hidden');
          $submit.prop('disabled', false);
        });

        return false;
      },
      'change input[name="remove"]': function(e)
      {
        this.$id('submit')
          .removeClass('btn-primary btn-danger')
          .addClass(e.currentTarget.value === '1' ? 'btn-danger' : 'btn-primary');
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showRemoveOption: _.any(this.model.files, function(file)
        {
          return file.get('folders').length === 1;
        })
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
