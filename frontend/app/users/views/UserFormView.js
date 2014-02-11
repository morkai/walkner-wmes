define([
  'underscore',
  'app/i18n',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/views/FormView',
  'app/data/aors',
  'app/data/companies',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/prodFunctions',
  'app/data/privileges',
  'app/users/templates/form'
], function(
  _,
  t,
  OrgUnitDropdownsView,
  Model,
  FormView,
  aors,
  companies,
  divisions,
  subdivisions,
  prodFunctions,
  privileges,
  formTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

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

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.SUBDIVISION,
        allowClear: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.options.editMode)
      {
        this.$('input[type="password"]').attr('required', true);
      }

      this.$id('aors').select2({
        width: '100%',
        allowClear: true
      });

      this.setUpProdFunctionSelect2();
      this.setUpCompanySelect2();

      this.$id('privileges').select2({
        width: '100%',
        allowClear: false
      });

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        /*jshint -W015*/

        var model = null;
        var orgUnit = null;

        switch (this.model.get('orgUnitType'))
        {
          case 'division':
            orgUnit = ORG_UNIT.DIVISION;
            model = new Model({division: this.model.get('orgUnitId')});
            break;

          case 'subdivision':
            orgUnit = ORG_UNIT.SUBDIVISION;
            model = new Model({subdivision: this.model.get('orgUnitId')});
            break;
        }

        this.orgUnitDropdownsView.selectValue(model, orgUnit);
      });

      this.$id('company').on('change', function()
      {

      });
    },

    setUpProdFunctionSelect2: function()
    {
      this.$id('prodFunction').select2({
        width: '100%',
        allowClear: true,
        data: this.getProdFunctionsForCompany()
      });
    },

    setUpCompanySelect2: function()
    {
      var $company = this.$id('company').select2({
        width: '100%',
        allowClear: true
      });
      var $prodFunction = this.$id('prodFunction');
      var view = this;

      $company.on('change', function(e)
      {
        var oldValue = $prodFunction.val();

        $prodFunction.select2('val', null);

        view.setUpProdFunctionSelect2();

        $prodFunction.select2('val', oldValue);
      });
    },

    getProdFunctionsForCompany: function()
    {
      var company = this.$id('company').val();

      if (company === '')
      {
        return [];
      }

      return prodFunctions
        .filter(function(prodFunction)
        {
          return prodFunction.get('companies').indexOf(company) !== -1;
        })
        .map(function(prodFunction)
        {
          return {
            id: prodFunction.id,
            text: prodFunction.getLabel()
          };
        });
    },

    validatePasswords: function()
    {
      var $password1 = this.$id('password');
      var $password2 = this.$id('password2');

      if ($password1.val() === $password2.val())
      {
        $password2[0].setCustomValidity('');
      }
      else
      {
        $password2[0].setCustomValidity(t('users', 'FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        aors: aors.toJSON(),
        companies: companies.toJSON(),
        privileges: privileges
      });
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: [],
        aors: []
      });

      if (typeof formData.aors === 'string')
      {
        formData.aors = formData.aors.split(',');
      }

      if (!formData.company || !formData.company.length)
      {
        formData.company = null;
      }

      if (!formData.prodFunction || !formData.prodFunction.length)
      {
        formData.prodFunction = null;
      }

      if (formData.subdivision)
      {
        formData.orgUnitType = 'subdivision';
        formData.orgUnitId = formData.subdivision;
      }
      else if (formData.division)
      {
        formData.orgUnitType = 'division';
        formData.orgUnitId = formData.division;
      }
      else
      {
        formData.orgUnitType = 'unspecified';
        formData.orgUnitId = null;
      }

      return formData;
    }

  });
});
