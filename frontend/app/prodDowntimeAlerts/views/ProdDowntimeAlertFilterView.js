// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/prodDowntimeAlerts/templates/filter'
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
        name: ''
      };
    },

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].replace(/\\(.)/g, '$1');
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'name', -1, null, true);
    }

  });
});
