// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/kanban/templates/splitEntry'
], function(
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
        this.submit();

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        entry: this.model.toJSON()
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    submit: function()
    {
      var view = this;
      var $submit = view.$('[type=submit]').attr('disabled', true);

      viewport.msg.saving();

      var req = view.ajax({
        type: 'POST',
        url: '/kanban/entries/' + view.model.id + ';split',
        data: JSON.stringify({
          parts: parseInt(view.$id('parts').val(), 10)
        })
      });

      req.done(function()
      {
        viewport.msg.saved();
        view.closeDialog();
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        $submit.attr('disabled', false);
      });
    }

  });
});
