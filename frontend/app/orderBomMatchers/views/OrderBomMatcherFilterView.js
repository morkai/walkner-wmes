// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/orderBomMatchers/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      description: ''
    },

    termToForm: {
      'description': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'description', null, null, true, false);
    }

  });
});
