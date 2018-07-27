// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/kanban/templates/importXlsx'
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

    getTemplateData: function()
    {
      return {
        what: this.model.what
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

      var view = this;
      var $submit = view.$('[type=submit]').attr('disabled', true);

      var formData = new FormData(view.el);

      var req = view.ajax({
        type: 'POST',
        url: '/kanban/import/' + view.model.what,
        data: formData,
        processData: false,
        contentType: false
      });

      req.then(function()
      {
        view.closeDialog();
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('kanban', 'msg:import:failure')
        });
      });

      req.always(function()
      {
        $submit.attr('disabled', false);
      });
    }

  });
});
