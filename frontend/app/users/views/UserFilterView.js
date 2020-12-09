// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/data/loadedModules',
  'app/data/prodFunctions',
  'app/data/companies',
  'app/data/privileges',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  _,
  user,
  loadedModules,
  prodFunctions,
  companies,
  privileges,
  idAndLabel,
  FilterView,
  setUpUserSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    termToForm: {
      'personnelId': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'prodFunction': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'company': 'prodFunction',
      'login': 'personnelId',
      'searchName': 'personnelId'
    },

    getTemplateData: function()
    {
      return {
        prodFunctions: loadedModules.isLoaded('prodFunctions') ? prodFunctions.map(idAndLabel) : [],
        companies: loadedModules.isLoaded('companies') ? companies.map(idAndLabel) : [],
        privileges: !user.isAllowedTo('USERS:MANAGE') ? [] : privileges
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
    },

    serializeFormToQuery: function(selector)
    {
      var searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', '^' + searchName]});
      }

      this.serializeRegexTerm(selector, 'personnelId', null, undefined, false, true);
      this.serializeRegexTerm(selector, 'login', null, null, true, true);

      ['company', 'prodFunction', 'privileges'].forEach(p =>
      {
        var v = this.$id(p).val() || '';

        if (v.length)
        {
          selector.push({name: 'eq', args: [p, v]});
        }
      });
    }

  });
});
