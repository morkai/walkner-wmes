// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/ZeroClipboard',
  'app/i18n',
  'app/user',
  'app/core/Model',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/views/OrgUnitDropdownsView',
  'app/data/aors',
  'app/data/companies',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/prodFunctions',
  'app/data/privileges',
  'app/data/loadedModules',
  'app/vendors/util/setUpVendorSelect2',
  'app/users/templates/form'
], function(
  _,
  $,
  ZeroClipboard,
  t,
  user,
  Model,
  FormView,
  idAndLabel,
  OrgUnitDropdownsView,
  aors,
  companies,
  divisions,
  subdivisions,
  prodFunctions,
  privileges,
  loadedModules,
  setUpVendorSelect2,
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

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 30);
      },
      'change #-aors': 'resizeColumns'
    },

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.accountMode = this.options.editMode
        && user.data._id === this.model.id
        && !user.isAllowedTo('USERS:MANAGE');

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.SUBDIVISION,
        allowClear: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);

      this.listenTo(this.orgUnitDropdownsView, 'afterRender', this.resizeColumns);

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resizeColumns.bind(this), 16));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.privilegesCopyClient)
      {
        this.privilegesCopyClient.destroy();
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.accountMode)
      {
        this.$id('aors').select2({
          width: '100%',
          allowClear: true
        });

        this.setUpProdFunctionSelect2();
        this.setUpCompanySelect2();
        this.setUpVendorSelect2();
        this.setUpPrivilegesControls();

        this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', this.setUpOrgUnitDropdowns);
      }

      this.resizeColumns();
    },

    setUpOrgUnitDropdowns: function()
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
        data: prodFunctions.map(idAndLabel)
      });
    },

    setUpCompanySelect2: function()
    {
      this.$id('company').select2({
        width: '100%',
        allowClear: true
      });
    },

    setUpVendorSelect2: function()
    {
      var $vendor = this.$id('vendor');

      if (!loadedModules.isLoaded('vendors'))
      {
        $vendor.closest('.form-group').remove();

        return;
      }

      setUpVendorSelect2($vendor, {
        placeholder: t('users', 'NO_DATA:vendor')
      });

      var vendor = this.model.get('vendor');

      if (vendor && vendor._id)
      {
        $vendor.select2('data', $vendor.prepareData(vendor));
      }
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
        privileges: privileges,
        accountMode: this.accountMode
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
    },

    resizeColumns: function()
    {
      var $columns = this.$('.col-lg-3');
      var $maxColumn = null;
      var maxHeight = 0;

      $columns.each(function()
      {
        var $column = $(this).css('height', '');
        var columnHeight = $column.outerHeight();

        if (columnHeight > maxHeight)
        {
          $maxColumn = $column;
          maxHeight = columnHeight;
        }
      });

      if (window.innerWidth >= 1200)
      {
        $columns.each(function()
        {
          this.style.height = this === $maxColumn[0] ? '' : (maxHeight + 'px');
        });
      }
    }

  });
});
