// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/kanbanComponents/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      description: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = this.unescapeRegExp(term.args[1]);
        }
      },
      'description': '_id'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      ['_id', 'description'].forEach(function(prop)
      {
        view.serializeRegexTerm(selector, prop, -1, null, true, false);
      });
    }

  });
});
