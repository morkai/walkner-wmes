// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/paintShopPaints/templates/filter'
], function(
  _,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      shelf: '',
      bin: '',
      name: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = this.unescapeRegExp(term.args[1]);
        }
      },
      'shelf': '_id',
      'bin': '_id',
      'name': '_id'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      ['_id', 'shelf', 'bin', 'name'].forEach(function(prop)
      {
        view.serializeRegexTerm(selector, prop, -1, null, true, false);
      });
    }

  });
});
