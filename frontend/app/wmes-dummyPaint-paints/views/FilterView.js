// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/wmes-dummyPaint-orders/dictionaries',
  'app/wmes-dummyPaint-paints/templates/filter'
], function(
  FilterView,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'code': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'family': 'code',
      'nc12': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'name': 'nc12'
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeEqTerm(selector, 'code', 'eq', null);
      this.serializeEqTerm(selector, 'family', 'eq', null);
      this.serializeRegexTerm(selector, 'nc12', 12, null, true, false);
      this.serializeRegexTerm(selector, 'name', 60, null, true, false);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('code').select2({
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.paintCodes.map(function(code)
        {
          return {
            id: code,
            text: code
          };
        })
      });

      this.$id('family').select2({
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.paintFamilies.map(function(family)
        {
          return {
            id: family,
            text: family
          };
        })
      });
    }

  });
});
