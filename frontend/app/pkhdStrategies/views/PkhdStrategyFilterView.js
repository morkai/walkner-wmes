// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/pkhdStrategies/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      s: '',
      t: '',
      name: ''
    },

    termToForm: {
      '_id.s': function(propertyName, term, formData)
      {
        formData.s = term.args[1];
      },
      '_id.t': function(propertyName, term, formData)
      {
        formData.t = term.args[1];
      },
      'name': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      var s = this.$id('s').val().trim();
      var t = this.$id('t').val().trim();

      this.serializeRegexTerm(selector, 'name', null, null, true, false);

      if (/^[0-9]+$/.test(s))
      {
        selector.push({name: 'eq', args: ['_id.s', +s]});
      }

      if (/^[0-9]+$/.test(t))
      {
        selector.push({name: 'eq', args: ['_id.t', +t]});
      }
    }

  });
});
