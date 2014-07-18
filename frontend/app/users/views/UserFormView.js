// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/ZeroClipboard',
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
  ZeroClipboard,
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

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');

      if (this.privilegesCopyClient)
      {
        this.privilegesCopyClient.destroy();
      }
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
      this.setUpVendorSelect2();
      this.setUpPrivilegesControls();

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
    },

    setUpPrivilegesControls: function()
    {
      var privilegeMap = {};
      var privilegeList = [];

      privileges.forEach(function(privilege)
      {
        var tag = t('users', 'PRIVILEGE:' + privilege);

        privilegeMap[tag] = privilege;
        privilegeList.push({
          id: privilege,
          text: tag
        });
      });

      var $privileges = this.$id('privileges').select2({
        width: '100%',
        allowClear: false,
        tags: privilegeList,
        tokenSeparators: [';'],
        createSearchChoice: function(term)
        {
          var tag = term.trim();
          var privilege = privilegeMap[tag];

          return !privilege ? null : {
            id: privilege,
            text: tag
          };
        }
      });

      this.privilegesCopyClient = new ZeroClipboard(this.$id('copyPrivileges'));

      this.privilegesCopyClient.on('load', function(client)
      {
        client.on('datarequested', function(client)
        {
          var selectedOptions = $privileges.select2('data');

          if (selectedOptions.length === 0)
          {
            client.setText('');
          }
          else
          {
            client.setText(
              selectedOptions.map(function(data) { return data.text; }).join(';') + ';'
            );
          }
        });
      } );

      this.privilegesCopyClient.on('wrongflash noflash', function()
      {
        ZeroClipboard.destroy();
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

      $company.on('change', function()
      {
        var oldValue = $prodFunction.val();

        $prodFunction.select2('val', null);

        view.setUpProdFunctionSelect2();

        $prodFunction.select2('val', oldValue);
      });
    },

    setUpVendorSelect2: function()
    {
      var $vendor = this.$id('vendor').select2({
        width: '100%',
        allowClear: true,
        minimumInputLength: 3,
        placeholder: t('users', 'NO_DATA:vendor'),
        ajax: {
          cache: true,
          quietMillis: 300,
          url: function(term)
          {
            term = term.trim();

            var property = /^[0-9]+$/.test(term) ? '_id' : 'name';

            term = encodeURIComponent(term);

            return '/vendors'
              + '?sort(' + property + ')'
              + '&limit(50)&regex(' + property + ',string:' + term + ',i)';
          },
          results: function(data)
          {
            return {
              results: data.collection.map(vendorToSelect2)
            };
          }
        }
      });

      var vendor = this.model.get('vendor');

      if (vendor && vendor._id)
      {
        $vendor.select2('data', vendorToSelect2(vendor));
      }

      function vendorToSelect2(vendor)
      {
        var text = vendor._id;

        if (vendor.name)
        {
          text += ': ' + vendor.name;
        }

        return {
          id: vendor._id,
          text: text
        };
      }
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

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.privileges = formData.privileges.join(',');
      formData.vendor = null;

      return formData;
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

      if (typeof formData.privileges === 'string')
      {
        formData.privileges = formData.privileges.split(',');
      }

      if (!formData.company || !formData.company.length)
      {
        formData.company = null;
      }

      if (!formData.prodFunction || !formData.prodFunction.length)
      {
        formData.prodFunction = null;
      }

      if (!formData.vendor || !formData.vendor.length)
      {
        formData.vendor = null;
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
