// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/isa/templates/eventListFilter'
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
      'time': dateTimeRange.rqlToForm,
      'type': function(propertyName, term, formData)
      {
        formData.type = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        mode: 'array',
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('type').select2({
        width: '275px',
        allowClear: true,
        placeholder: ' '
      });
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      var type = this.$id('type').val();

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }
    }

  });
});
