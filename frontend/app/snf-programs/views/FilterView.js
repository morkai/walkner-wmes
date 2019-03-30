// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/snf-programs/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      name: ''
    },

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
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
