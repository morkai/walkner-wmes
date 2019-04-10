// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/wmes-snf-programs/templates/imageForm'
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
      'submit': function()
      {
        var view = this;
        var $label = view.$id('label');
        var $primary = view.$('.btn-primary').attr('disabled', true);

        var req = view.ajax({
          type: 'PUT',
          url: view.el.action,
          data: JSON.stringify({label: $label.val()})
        });

        req.done(view.onFormSuccess.bind(view));

        req.fail(function()
        {
          $primary.attr('disabled', false);

          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('gallery:edit:failure')
          });

          $label.focus();
        });

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        programId: this.model.programId,
        image: this.model.image
      };
    },

    onFormSuccess: function()
    {

    },

    onDialogShown: function(viewport)
    {
      this.onFormSuccess = viewport.closeDialog.bind(viewport);
    }

  });
});
