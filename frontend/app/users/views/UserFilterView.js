// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/users/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      personellId: '',
      login: '',
      lastName: ''
    },

    termToForm: {
      'personellId': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'login': 'personellId',
      'lastName': 'personellId'
    },

    serializeFormToQuery: function(selector)
    {
      var personellId = parseInt(this.$id('personellId').val().trim(), 10);
      var login = this.$id('login').val().trim();
      var lastName = this.$id('lastName').val().trim();

      if (!isNaN(personellId))
      {
        selector.push({name: 'regex', args: ['personellId', '^' + personellId, 'i']});
      }

      if (login.length)
      {
        selector.push({name: 'regex', args: ['login', '^' + login, 'i']});
      }

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }
    }

  });
});
