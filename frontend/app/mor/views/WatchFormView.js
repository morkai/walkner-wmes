// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/mor/templates/watchForm'
], function(
  _,
  t,
  viewport,
  View,
  idAndLabel,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        var view = this;
        var $submit = view.$id('submit').prop('disabled', true);
        var params = {
          user: view.model.selected ? view.model.selected.user : view.$id('user').val(),
          from: view.$id('from').val(),
          to: view.$id('to').val()
        };

        view.model.mor[view.model.selected ? 'editWatch' : 'addWatch'](params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'watchForm:failure:' + view.model.nlsSuffix)
            });

            $submit.prop('disabled', false);
          })
          .done(function()
          {
            view.closeDialog();
          });

        return false;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        nlsSuffix: this.model.nlsSuffix,
        selected: this.model.selected
      };
    },

    afterRender: function()
    {
      var watchUsers = _.pluck(this.model.mor.get('watch'), 'user');

      this.$id('user').select2({
        data: this.model.mor.users
          .filter(function(user) { return !_.contains(watchUsers, user.id); })
          .map(idAndLabel)
      });

      if (this.model.selected)
      {
        this.$id('user').select2('disable', true).select2('data', {
          id: this.model.selected.user,
          text: this.model.mor.users.get(this.model.selected.user).getLabel()
        });
      }
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      if (this.model.selected)
      {
        this.$id('from').select();
      }
      else
      {
        this.$id('user').focus();
      }
    },

    closeDialog: function() {}

  });
});
