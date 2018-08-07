// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/kanbanSupplyAreas/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      name: '',
      family: ''
    },

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = this.unescapeRegExp(term.args[1]);
        }
      },
      'family': 'name'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      ['name', 'family'].forEach(function(prop)
      {
        view.serializeRegexTerm(selector, prop, -1, null, true, false);
      });
    }

  });
});
