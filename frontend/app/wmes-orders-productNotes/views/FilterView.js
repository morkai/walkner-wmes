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
      description: ''
    },

    termToForm: {
      'description': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      }
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
      var nc12 = this.$id('nc12').val().split(/[^0-9a-zA-Z]+/).filter(function(v) { return !!v.length; });
      var target = this.$id('target').val() || [];

      this.$id('nc12').val(nc12.join(', '));

      if (nc12.length)
      {
        selector.push({name: 'in', args: ['nc12', nc12]});
      }

      if (target.length && target.length !== this.$id('target').find('option').length)
      {
        selector.push({name: 'in', args: ['target', target]});
      }
    }

  });
});
