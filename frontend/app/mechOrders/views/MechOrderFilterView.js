// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/mechOrders/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      _id: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        var value = term.args[1];

        formData[propertyName] = typeof value === 'string' ? value.replace(/[^0-9a-zA-Z]/g, '') : '';
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, '_id', 12, null, false, true);
    }

  });
});
