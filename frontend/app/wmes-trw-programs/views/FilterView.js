// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/wmes-trw-tests/dictionaries',
  'app/wmes-trw-programs/templates/filter'
], function(
  FilterView,
  idAndLabel,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'tester': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'name': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('tester').select2({
        width: '200px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.testers.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var tester = this.$id('tester').val();

      if (tester.length)
      {
        selector.push({name: 'eq', args: ['tester', tester]});
      }

      this.serializeRegexTerm(selector, 'name', 100, null, true, false);
    }

  });
});
