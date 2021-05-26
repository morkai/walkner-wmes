// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/users/templates/logInForm',
  'i18n!app/nls/users'
], function(
  currentUser,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': 'submitForm',
      'keypress input': function()
      {
        this.$id('login')[0].setCustomValidity('');
        this.$submit.removeClass('btn-danger').addClass('btn-primary');
      },
      'input input[type="password"]': function()
      {
        this.togglePasswordValidity();
      },
      'click #-loginLink': function()
      {
        this.switchToLogin();
      },
      'click #-resetLink': function()
      {
        this.switchToReset();
      },
      'click #-office365': function()
      {
        window.location.href = '/auth/office365?returnUrl=' + encodeURIComponent(window.location.href);
      }
    },

    nlsDomain: 'users',

    initialize: function()
    {
      this.resetting = false;
      this.originalTitle = null;
      this.$title = null;
      this.$submit = null;
      this.model = {};
    },

    destroy: function()
    {
      this.$title = null;
      this.$submit = null;
    },

    getTemplateData: function()
    {
      return {
        OFFICE365_TENANT: window.OFFICE365_TENANT
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$title = view.getTitleEl();
      view.$submit = view.$('.logInForm-submit');

      view.$id('loginLink').hide();

      if (this.model && this.model.unknown)
      {
        view.$id('login').val(this.model.unknown)[0].setCustomValidity(t('users', 'LOG_IN_FORM:UNKNOWN'));
        view.$submit.removeClass('btn-primary').addClass('btn-danger').click();
      }
      else
      {
        view.$id('login').focus();
      }

      view.originalTitle = view.$title.text();

      if (window.CORS_PING_URL && window.OFFICE365_TENANT)
      {
        view.ajax({url: window.CORS_PING_URL, dataType: 'text'}).done(function()
        {
          view.$id('office365').removeClass('hidden');
        });
      }
    },

    submitForm: function()
    {
      var view = this;

      if (!view.$submit.hasClass('btn-primary'))
      {
        return false;
      }

      var data = {
        login: view.$id('login').val(),
        password: view.$id('password').val(),
        socketId: view.socket.getId()
      };

      if (!data.login.length || !data.password.length)
      {
        return false;
      }

      if (this.resetting)
      {
        data.subject = view.t('LOG_IN_FORM:RESET:SUBJECT', {
          APP_NAME: view.t('core', 'APP_NAME')
        });
        data.text = view.t('LOG_IN_FORM:RESET:TEXT', {
          APP_NAME: view.t('core', 'APP_NAME'),
          appUrl: window.location.origin,
          resetUrl: window.location.origin + '/resetPassword/{REQUEST_ID}'
        });
      }

      view.$el.addClass('logInForm-loading');
      view.$submit.prop('disabled', true);
      view.$('.btn-link').prop('disabled', true);

      var req = view.ajax({
        type: 'POST',
        url: view.el.action,
        data: JSON.stringify(data)
      });

      req.done(function()
      {
        if (!view.$submit)
        {
          return;
        }

        if (view.resetting)
        {
          viewport.msg.show({
            type: 'info',
            time: 5000,
            text: view.t('LOG_IN_FORM:RESET:MSG:SUCCESS')
          });
        }
        else
        {
          view.$submit.removeClass('btn-primary').addClass('btn-success');
        }
      });

      req.fail(function(res)
      {
        var error = res.responseJSON && res.responseJSON.error || {};

        if (error.code === 'UNSAFE_PASSWORD')
        {
          view.switchToReset(view.t('LOG_IN_FORM:UNSAFE_PASSWORD'));

          return;
        }

        if (view.$submit)
        {
          view.$submit.removeClass('btn-primary').addClass('btn-danger');
        }

        if (view.t.has('LOG_IN_FORM:MSG:' + error.code))
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('LOG_IN_FORM:MSG:' + error.code)
          });
        }
        else if (view.resetting)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('LOG_IN_FORM:RESET:MSG:FAILURE')
          });
        }
      });

      req.always(function(res)
      {
        if (view.$submit)
        {
          view.$submit.attr('disabled', false);
          view.$('.btn-link').prop('disabled', false);
          view.$el.removeClass('logInForm-loading');
          view.$('[autofocus]').focus();
        }

        if (view.resetting && !res)
        {
          view.$id('loginLink').click();
        }
      });

      return false;
    },

    getTitleEl: function()
    {
      var $modalContent = this.$el.closest('.modal-content');

      if ($modalContent.length)
      {
        return $modalContent.find('.modal-title');
      }

      return this.$el.closest('.page').find('.page-breadcrumbs > :last-child');
    },

    togglePasswordValidity: function()
    {
      var error = '';

      if (this.resetting && this.$id('password').val() !== this.$id('password2').val())
      {
        error = this.t('LOG_IN_FORM:PASSWORD_MISMATCH');
      }

      this.$id('password2')[0].setCustomValidity(error);
    },

    switchToLogin: function(message)
    {
      this.$el.attr('action', '/login');
      this.$id('loginLink').hide();
      this.$id('resetLink').show();
      this.$id('login').select();
      this.$id('password').val('').attr('placeholder', this.t('LOG_IN_FORM:LABEL:PASSWORD'));
      this.$id('password2').val('').prop('required', false);
      this.$id('password2-container').addClass('hidden');
      this.$('.logInForm-submit-label').text(this.t('LOG_IN_FORM:SUBMIT:LOG_IN'));

      this.resetting = false;

      this.onModeSwitch(message);
    },

    switchToReset: function(message)
    {
      this.$el.attr('action', '/resetPassword/request');
      this.$id('resetLink').hide();
      this.$id('loginLink').show();
      this.$id('login').select();
      this.$id('password').val('').attr('placeholder', this.t('LOG_IN_FORM:LABEL:NEW_PASSWORD'));
      this.$id('password2').val('').prop('required', true);
      this.$id('password2-container').removeClass('hidden');
      this.$('.logInForm-submit-label').text(this.t('LOG_IN_FORM:SUBMIT:RESET'));

      this.resetting = true;

      this.onModeSwitch(message);
    },

    onModeSwitch: function(message)
    {
      this.$title.text(this.resetting ? this.t('LOG_IN_FORM:TITLE:RESET') : this.originalTitle);
      this.$submit.removeClass('btn-danger').addClass('btn-primary');

      if (message)
      {
        this.$id('message').html(message).removeClass('hidden');
      }
      else
      {
        this.$id('message').addClass('hidden');
      }
    }

  });
});
