// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/user',
  'app/data/loadedModules',
  'app/data/prodFunctions',
  'app/data/companies',
  'app/data/privileges',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  require,
  _,
  user,
  loadedModules,
  prodFunctions,
  companies,
  privileges,
  idAndLabel,
  FilterView,
  OrgUnitPickerView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: function()
    {
      return [
        'login',
        'personnelId',
        'card',
        loadedModules.isLoaded('companies') ? 'company' : null,
        loadedModules.isLoaded('prodFunctions') ? 'prodFunction' : null,
        loadedModules.isLoaded('orgUnits') ? 'prodOrgUnit' : null,
        loadedModules.isLoaded('wmes-osh') ? 'oshOrgUnit' : null,
        'active',
        user.isAllowedTo('USERS:MANAGE') ? 'privileges' : null,
        'limit'
      ].filter(f => !!f);
    },
    filterMap: {
      lastName: 'searchName',
      oshWorkplace: 'oshOrgUnit',
      oshDepartment: 'oshOrgUnit'
    },

    template: template,

    termToForm: {
      'login': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]).replace(/^\^/, '');
      },
      'searchName': 'login',
      'card': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'personnelId': 'card',
      'company': 'card',
      'prodFunction': 'card',
      'active': 'card'
    },

    events: Object.assign({

      'click #-active .btn': function(e)
      {
        if (e.currentTarget.classList.contains('active'))
        {
          setTimeout(() =>
          {
            this.$(e.currentTarget).removeClass('active').find('input').prop('checked', false);
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      if (loadedModules.isLoaded('orgUnits'))
      {
        this.setUpProdOrgUnit();
      }

      if (loadedModules.isLoaded('wmes-osh'))
      {
        this.setUpOshOrgUnit();
      }
    },

    getTemplateData: function()
    {
      return {
        prodFunctions: loadedModules.isLoaded('prodFunctions') ? prodFunctions.map(idAndLabel) : [],
        companies: loadedModules.isLoaded('companies') ? companies.map(idAndLabel) : [],
        privileges: user.isAllowedTo('USERS:MANAGE') ? privileges : [],
        prodOrgUnit: loadedModules.isLoaded('orgUnits'),
        oshOrgUnit: loadedModules.isLoaded('wmes-osh')
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('company').select2({
        width: '150px',
        allowClear: true
      });

      this.$id('prodFunction').select2({
        width: '250px',
        allowClear: true
      });

      this.$id('privileges').select2({
        width: '250px',
        allowClear: true
      });

      this.toggleButtonGroup('active');
    },

    serializeFormToQuery: function(selector)
    {
      const searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', `^${searchName}`]});
      }

      this.serializeRegexTerm(selector, 'login', null, null, true, true);

      const active = this.getButtonGroupValue('active', null);

      if (active !== null)
      {
        selector.push({name: 'eq', args: ['active', active === 'true']});
      }

      ['personnelId', 'company', 'prodFunction', 'privileges', 'card'].forEach(p =>
      {
        const v = this.$id(p).val() || '';

        if (v.length)
        {
          selector.push({name: 'eq', args: [p, v]});
        }
      });
    },

    setUpProdOrgUnit: function()
    {
      this.setView('#-prodOrgUnit', new OrgUnitPickerView({
        filterView: this,
        orgUnitTypes: ['division', 'subdivision'],
        divisionFilter: () => true
      }));
    },

    setUpOshOrgUnit: function()
    {
      const OrgUnitPickerFilterView = require('app/wmes-osh-common/views/OrgUnitPickerFilterView');

      this.setView('#-oshOrgUnit', new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('PROPERTY:orgUnit'),
        orgUnitTerms: {
          'oshDivision': 'division',
          'oshWorkplace': 'workplace',
          'oshDepartment': 'department'
        },
        orgUnitTypes: ['division', 'workplace', 'department']
      }));
    }

  });
});
