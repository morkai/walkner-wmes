// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/prodFunctions',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  _,
  prodFunctions,
  idAndLabel,
  FilterView,
  setUpUserSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      personellId: '',
      login: '',
      searchName: ''
    },

    termToForm: {
      'personellId': function(propertyName, term, formData)
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
      'login': 'personellId',
      'searchName': 'personellId'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.apply(this, arguments), {
        prodFunctions: prodFunctions.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var personellId = parseInt(this.$id('personellId').val().trim(), 10);
      var login = this.$id('login').val().trim();
      var searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());
      var prodFunction = this.$id('prodFunction').val();

      if (!isNaN(personellId))
      {
        selector.push({name: 'regex', args: ['personellId', '^' + personellId, 'i']});
      }

      if (login.length)
      {
        selector.push({name: 'regex', args: ['login', '^' + login, 'i']});
      }

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', '^' + searchName]});
      }

      if (prodFunction.length)
      {
        selector.push({name: 'eq', args: ['prodFunction', prodFunction]});
      }
    }

  });
});
