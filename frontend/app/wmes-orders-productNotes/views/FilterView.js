// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/wmes-orders-productNotes/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      codes: '',
      target: []
    },

    termToForm: {
      'codes': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'target': 'codes'
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormToQuery: function(selector)
    {
      var codes = this.$id('codes').val().toUpperCase();
      var target = this.$id('target').val() || [];

      if (codes.length)
      {
        selector.push({name: 'eq', args: ['codes', codes]});
      }

      if (target.length && target.length !== this.$id('target').find('option').length)
      {
        selector.push({name: 'in', args: ['target', target]});
      }
    }

  });
});
