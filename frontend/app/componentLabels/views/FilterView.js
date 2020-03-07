// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/componentLabels/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'componentCode': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'operationNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeRegexTerm(selector, 'componentCode', 12, undefined, false, true);

      var operationNo = this.$id('operationNo').val().replace(/[^0-9]+/g, '');

      while (operationNo.length < 4)
      {
        operationNo = '0' + operationNo;
      }

      if (operationNo !== '0000')
      {
        selector.push({name: 'eq', args: ['operationNo', operationNo]});
      }
    }

  });
});
