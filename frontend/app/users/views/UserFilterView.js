// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/data/loadedModules',
  'app/data/prodFunctions',
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
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'prodFunction': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'login': 'personnelId',
      'searchName': 'personnelId'
    },

    getTemplateData: function()
    {
      return {
        prodFunctions: loadedModules.isLoaded('prodFunctions') ? prodFunctions.map(idAndLabel) : [],
        privileges: !user.isAllowedTo('USERS:MANAGE') ? [] : privileges
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('privileges').select2({
        width: '250px',
        allowClear: true
      });
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'personnelId', null, undefined, false, true);
      this.serializeRegexTerm(selector, 'login', null, null, true, true);
      this.serializeRegexTerm(selector, 'searchName', null, null, true, true);

      var prodFunction = this.$id('prodFunction').val() || '';

      if (prodFunction.length)
      {
        selector.push({name: 'eq', args: ['prodFunction', prodFunction]});
      }

      var privileges = this.$id('privileges').val() || '';

      if (privileges.length)
      {
        selector.push({name: 'eq', args: ['privileges', privileges]});
      }
    }

  });
});
