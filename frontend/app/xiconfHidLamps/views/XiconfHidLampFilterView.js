// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  '../XiconfHidLamp',
  'app/xiconfHidLamps/templates/filter'
], function(
  _,
  FilterView,
  XiconfHidLamp,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      _id: '',
      nc12: '',
      description: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'description': '_id',
      'nc12': '_id'
    },

    serializeFormToQuery: function(selector)
    {
      ['_id', 'nc12', 'description'].forEach(function(prop)
      {
        this.serializeRegexTerm(selector, prop, -1, null, true);
      }, this);
    }

  });
});
