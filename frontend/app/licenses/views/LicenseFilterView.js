// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/licenses/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      appId: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'appId': '_id'
    },

    serializeFormToQuery: function(selector)
    {
       var appId = this.$id('appId').val();

      if (appId)
      {
        selector.push({name: 'eq', args: ['appId', appId]});
      }

      this.serializeRegexTerm(selector, '_id', 32, /[^0-9a-fA-F-]/g);
    }

  });
});
