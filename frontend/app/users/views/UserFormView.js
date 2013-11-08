define([
  'underscore',
  'app/i18n',
  'app/core/views/FormView',
  'app/data/privileges',
  'app/users/templates/form',
  'i18n!app/nls/users'
], function(
  _,
  t,
  FormView,
  privileges,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'userForm',

    successUrlPrefix: '/users/',

    events: {
      'submit': 'submitForm',
      'input input[type="password"]': function(e)
      {
        if (this.timers.validatePasswords !== null)
        {
          clearTimeout(this.timers.validatePasswords);
        }

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 100);
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.requirePassword)
      {
        this.$('input[type="password"]').attr('required', true);
      }
    },

    validatePasswords: function()
    {
      var password1 = this.el.querySelector('#' + this.idPrefix + '-password');
      var password2 = this.el.querySelector('#' + this.idPrefix + '-password2');

      if (password1.value === password2.value)
      {
        password2.setCustomValidity('');
      }
      else
      {
        password2.setCustomValidity(t('users', 'FORM_ERROR_PASSWORD_MISMATCH'));
      }

      this.timers.validatePassword = null;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        privileges: privileges
      });
    },

    serializeForm: function(formData)
    {
      return _.defaults(formData, {privileges: []});
    }

  });
});
