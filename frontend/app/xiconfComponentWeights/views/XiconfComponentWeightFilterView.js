// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  '../XiconfComponentWeight',
  'app/xiconfComponentWeights/templates/filter'
], function(
  _,
  FilterView,
  XiconfComponentWeight,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      nc12: '',
      description: ''
    },

    termToForm: {
      'nc12': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'description': 'nc12'
    },

    serializeFormToQuery: function(selector)
    {
      ['nc12', 'description'].forEach(function(prop)
      {
        this.serializeRegexTerm(selector, prop, -1, null, true);
      }, this);
    }

  });
});
