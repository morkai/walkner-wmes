// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
          section: view.model.section._id,
          user: view.model.watch ? view.model.watch.user : view.$id('user').val(),
          days: view.$('input[name="days"]:checked').map(function() { return +this.value; }).get(),
          from: view.$id('from').val(),
          to: view.$id('to').val()
        };

        view.model.mor[view.model.watch ? 'editWatch' : 'addWatch'](params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'watchForm:failure:' + view.model.mode)
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
        mode: this.model.mode,
        section: this.model.section.name,
        watch: this.model.watch
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

      if (this.model.mode === 'edit')
      {
        this.$id('user').select2('disable', true).select2('data', {
          id: this.model.watch.user,
          text: this.model.mor.users.get(this.model.watch.user).getLabel()
        });
      }
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id(this.model.mode === 'edit' ? 'from' : 'user').focus();
    },

    closeDialog: function() {}

  });
});
