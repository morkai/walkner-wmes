define([
  'underscore',
  'app/i18n',
  'app/core/views/FormView',
  'app/data/aors',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/data/privileges',
  'app/users/templates/form',
  'i18n!app/nls/users'
], function(
  _,
  t,
  FormView,
  aors,
  companies,
  prodFunctions,
  privileges,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'userForm',

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

      if (!this.options.editMode)
      {
        this.$('input[type="password"]').attr('required', true);
      }

      this.$('#' + this.idPrefix + '-aor').select2({
        width: '100%',
        allowClear: true
      });
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
        password2.setCustomValidity(t('users', 'FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    serialize: function()
    {
      var templateData = _.extend(FormView.prototype.serialize.call(this), {
        aors: aors.toJSON(),
        companies: companies.toJSON(),
        prodFunctions: prodFunctions,
        privileges: privileges
      });

      if (templateData.model.company === null)
      {
        templateData.model.company = null;
      }

      return templateData;
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: [],
        aor: null
      });

      if (formData.company === 'null')
      {
        formData.company = null;
      }

      return formData;
    }

  });
});
