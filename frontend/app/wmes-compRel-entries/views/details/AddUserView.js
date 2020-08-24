// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-entries/templates/details/addUser'
], function(
  viewport,
  View,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wmes-compRel-entries',

    events: {

      'submit': function()
      {
        this.submit();

        return false;
      }

    },

    afterRender: function()
    {
      var view = this;
      var data = view.model.entry.get('funcs').map(function(func)
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

      setUpUserSelect2(view.$id('users'), {
        multiple: true,
        allowClear: true,
        noPersonnelId: true
      });
    },

    onDialogShown: function()
    {
      this.$id('users').focus();
    },

    submit: function()
    {
      var view = this;

      viewport.msg.saving();

      view.$('.btn-primary').prop('disabled', true);

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.entry.id + ';add-user',
        data: JSON.stringify({
          func: view.$id('func').val(),
          users: setUpUserSelect2.getUserInfo(view.$id('users'))
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$('.btn-primary').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
