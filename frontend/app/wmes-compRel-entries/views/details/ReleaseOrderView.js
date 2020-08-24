// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-entries/Entry',
  'app/wmes-compRel-entries/templates/details/releaseOrder'
], function(
  viewport,
  View,
  dictionaries,
  Entry,
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

    onDialogShown: function()
    {
      this.$id('orders').focus();
    },

    submit: function()
    {
      var view = this;

      viewport.msg.saving();

      view.$id('submit').prop('disabled', true);

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';release-order',
        data: JSON.stringify({
          orders: view.$id('orders').val().split(/[^0-9]+/).filter(function(v) { return v.length === 9; }),
          comment: view.$id('comment').val().trim()
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$id('submit').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
