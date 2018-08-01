// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/users/templates/logInForm'
], function(
  user,
  t,
  viewport,
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
        this.$id('login')[0].setCustomValidity('');
        this.$submit.removeClass('btn-danger').addClass('btn-primary');
      },
      'click #-loginLink': function()
      {
        this.$el.attr('action', '/login');
        this.$id('loginLink').hide();
        this.$id('resetLink').show();
        this.$id('login').select();
        this.$id('password').attr('placeholder', t('users', 'LOG_IN_FORM:LABEL:PASSWORD'));
        this.$('.logInForm-submit-label').text(t('users', 'LOG_IN_FORM:SUBMIT:LOG_IN'));

        this.resetting = false;

        this.onModeSwitch();
      },
      'click #-resetLink': function()
      {
        this.$el.attr('action', '/resetPassword/request');
        this.$id('resetLink').hide();
        this.$id('loginLink').show();
        this.$id('login').select();
        this.$id('password').val('').attr('placeholder', t('users', 'LOG_IN_FORM:LABEL:NEW_PASSWORD'));
        this.$('.logInForm-submit-label').text(t('users', 'LOG_IN_FORM:SUBMIT:RESET'));

        this.resetting = true;

        this.onModeSwitch();
      },
      'click #-office365': function()
      {
        window.location.href = '/auth/office365?returnUrl=' + encodeURIComponent(window.location.href);
      }
    },

    initialize: function()
    {
      this.resetting = false;
      this.originalTitle = null;
      this.$title = null;
      this.$submit = null;
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
      if (!this.$submit.hasClass('btn-primary'))
      {
        return false;
      }

      var data = {
        login: this.$id('login').val(),
        password: this.$id('password').val(),
        socketId: this.socket.getId()
      };

      if (!data.login.length || !data.password.length)
      {
        return false;
      }

      if (this.resetting)
      {
        data.subject = t('users', 'LOG_IN_FORM:RESET:SUBJECT', {
          APP_NAME: t('core', 'APP_NAME')
        });
        data.text = t('users', 'LOG_IN_FORM:RESET:TEXT', {
          APP_NAME: t('core', 'APP_NAME'),
          appUrl: window.location.origin,
          resetUrl: window.location.origin + '/resetPassword/{REQUEST_ID}'
        });
      }

      this.$el.addClass('logInForm-loading');
      this.$submit.prop('disabled', true);
      this.$('.btn-link').prop('disabled', true);

      var req = this.ajax({
        type: 'POST',
        url: this.el.action,
        data: JSON.stringify(data)
      });

      var view = this;

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
            text: t('users', 'LOG_IN_FORM:RESET:MSG:SUCCESS')
          });
        }
        else
        {
          view.$submit.removeClass('btn-primary').addClass('btn-success');
        }
      });

      req.fail(function(res)
      {
        if (view.$submit)
        {
          view.$submit.removeClass('btn-primary').addClass('btn-danger');
        }

        if (view.resetting)
        {
          var error = res.responseJSON && res.responseJSON.error ? res.responseJSON.error : {};

          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t.has('users', 'LOG_IN_FORM:RESET:MSG:' + error.message)
              ? t('users', 'LOG_IN_FORM:RESET:MSG:' + error.message)
              : t('users', 'LOG_IN_FORM:RESET:MSG:FAILURE')
          });
        }
      });

      req.always(function()
      {
        if (view.$submit)
        {
          view.$submit.attr('disabled', false);
          view.$('.btn-link').prop('disabled', false);
          view.$el.removeClass('logInForm-loading');
          view.$('[autofocus]').focus();
        }

        if (view.resetting)
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

    onModeSwitch: function()
    {
      this.$title.text(this.resetting ? t('users', 'LOG_IN_FORM:TITLE:RESET') : this.originalTitle);
      this.$submit.removeClass('btn-danger').addClass('btn-primary');
    }

  });
});
