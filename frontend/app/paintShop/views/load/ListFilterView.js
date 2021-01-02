// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/FilterView',
  'app/core/util/ExpandableSelect',
  'app/core/util/forms/dateTimeRange',
  'app/paintShop/templates/load/listFilter'
], function(
  _,
  $,
  FilterView,
  ExpandableSelect,
  dateTimeRange,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {};
    },

    termToForm: {
      '_id.ts': dateTimeRange.rqlToForm,
      '_id.c': function(propertyName, term, formData)
      {
        formData.counter = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      var counter = this.$id('counter').val();

      if (counter && counter.length)
      {
        selector.push({name: 'in', args: ['_id.c', counter.map(function(v) { return +v; })]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$id('.is-expandable').expandableSelect('destroy');
    }

  });
});
