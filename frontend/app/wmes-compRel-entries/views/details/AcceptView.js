// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-entries/Entry',
  'app/wmes-compRel-entries/templates/details/accept'
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

    nlsDomain: 'wmes-compRel-entries',

    events: {

      'submit': function()
      {
        return false;
      },

      'click #-accept': function()
      {
        this.submit('accepted');
      },

      'click #-reject': function()
      {
        this.submit('rejected');
      },

      'click #-reset': function()
      {
        this.submit('pending');
      },

      'change #-func': function()
      {
        var func = this.model.entry.getFunc(this.$id('func').val());

        this.$id('comment').val(func.comment);
      }

    },

    afterRender: function()
    {
      var view = this;
      var data = view.model.entry.get('funcs')
        .filter(function(func) { return Entry.can.acceptFunc(view.model.entry, func._id); })
        .map(function(func)
        {
          return {
            id: func._id,
            text: dictionaries.funcs.getLabel(func._id)
          };
        });

      view.$id('func').val(view.model.func._id).select2({
        width: '100%',
        data: data
      });

      view.$id('comment').val(view.model.func.comment);
    },

    onDialogShown: function()
    {
      this.$id('comment').focus();
    },

    submit: function(status)
    {
      var view = this;

      viewport.msg.saving();

      view.$('.btn[id]').prop('disabled', true);

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.entry.id + ';accept',
        data: JSON.stringify({
          func: view.$id('func').val(),
          comment: view.$id('comment').val().trim(),
          status: status
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$('.btn[id]').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
