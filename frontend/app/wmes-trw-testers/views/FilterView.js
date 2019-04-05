// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/wmes-trw-testers/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'name', 100, null, true, false);
    }

  });
});
