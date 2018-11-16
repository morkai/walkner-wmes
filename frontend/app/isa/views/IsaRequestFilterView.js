// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/isa/templates/requestListFilter'
], function(
  _,
  orgUnits,
  FilterView,
  idAndLabel,
  dateTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'requestedAt': dateTimeRange.rqlToForm
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        mode: 'array',
        filterView: this
      }));
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      var line = this.$id('line').val();

      if (line && line.length)
      {
        selector.push({name: 'orgUnit', args: ['prodLine', line]});
      }
    }

  });
});
