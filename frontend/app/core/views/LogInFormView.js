define([
  'jquery',
  'app/user',
  '../View',
  'app/core/templates/logInForm',
  'i18n!app/nls/core'
], function(
  $,
  user,
  View,
  logInFormTemplate
) {
  'use strict';

  return View.extend({

    template: logInFormTemplate,

    events: {
      'submit': 'submitForm',
      'keypress input': function()
      {
        this.$submitEl.removeClass('btn-danger').addClass('btn-primary');
      }
    },

    destroy: function()
    {
      this.$submitEl = null;
    },

    afterRender: function()
    {
      this.$('input[name="login"]').focus();

      this.$submitEl = this.$('.logInForm-submit');
    },

    submitForm: function()
    {
      if (!this.$submitEl.hasClass('btn-primary'))
      {
        return false;
      }

      var data = {
        login: this.$('[name=login]').val(),
        password: this.$('[name=password]').val(),
        socketId: this.socket.getId()
      };

      if (data.login.length === 0 || data.password.length === 0)
      {
        return false;
      }

      this.$el.addClass('logInForm-loading');
      this.$submitEl.attr('disabled', true);

      var req = $.ajax({
        type: 'POST',
        url: this.el.action,
        data: JSON.stringify(data)
      });

      var view = this;

      req.done(function(userData)
      {
        view.$submitEl.removeClass('btn-primary').addClass('btn-success');

        user.reload(userData);
      });

      req.fail(function()
      {
        view.$submitEl.removeClass('btn-primary').addClass('btn-danger');
        view.$submitEl.attr('disabled', false);
        view.$el.removeClass('logInForm-loading');
        view.$('[autofocus]').focus();
      });

      return false;
    }

  });
});
