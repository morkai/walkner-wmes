// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/planning-orderGroups/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    defaultFormData: {
      search: '',
      target: ['plan', 'ct']
    },

    termToForm: {
      'search': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'target': function(propertyName, term, formData)
      {
        formData[propertyName] = [term.args[1]];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('target');
    },

    serializeFormToQuery: function(selector)
    {
      const search = this.$id('search').val().trim();
      const target = this.getButtonGroupValue('target');

      if (search.length)
      {
        selector.push({name: 'eq', args: ['search', search]});
      }

      if (target.length === 1)
      {
        selector.push({name: 'eq', args: ['target', target[0]]});
      }
    }

  });
});
