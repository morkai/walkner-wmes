// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/sapLaborTimeFixer/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: function()
    {
      return {
        title: ''
      };
    },

    termToForm: {
      'title': function(propertyName, term, formData)
      {
        formData.title = this.unescapeRegExp(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'title', null, null, true, false);
    }

  });
});
