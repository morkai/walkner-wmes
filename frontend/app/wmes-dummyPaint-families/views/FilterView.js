// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/wmes-dummyPaint-families/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'paintFamily': '_id'
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, '_id', 20, null, true, false);
      this.serializeRegexTerm(selector, 'paintFamily', 12, null, true, false);
    }

  });
});
