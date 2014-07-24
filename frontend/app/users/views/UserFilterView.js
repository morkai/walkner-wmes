// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      'lastName': 'personellId'
    },

    serializeFormToQuery: function(selector)
    {
      var personellId = parseInt(this.$id('personellId').val().trim(), 10);
      var lastName = this.$id('lastName').val().trim();

      if (!isNaN(personellId))
      {
        selector.push({name: 'regex', args: ['personellId', '^' + personellId, 'i']});
      }

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }
    }

  });
});
