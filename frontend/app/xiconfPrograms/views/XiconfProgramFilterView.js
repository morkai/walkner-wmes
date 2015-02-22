// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FilterView',
  'app/xiconfPrograms/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      name: ''
    },

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1];
        }
      }
    },

    serializeFormToQuery: function(selector)
    {
      var name = this.$id('name').val().trim();

      if (name.length)
      {
        selector.push({name: 'regex', args: ['name', name, 'i']});
      }
    }

  });
});
