// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/planning-orderGroups/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'search': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var search = this.$id('search').val().trim();

      if (search.length)
      {
        selector.push({name: 'eq', args: ['search', search]});
      }
    }

  });
});
