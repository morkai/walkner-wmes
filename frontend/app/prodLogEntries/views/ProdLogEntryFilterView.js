// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodLogEntries/templates/filter'
], function(
  _,
  user,
  FilterView,
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

    defaultFormData: {},

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'type': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('type').select2({
        width: '275px',
        allowClear: true
      });
    },

    serializeFormToQuery: function(selector)
    {
      var type = this.$id('type').val();

      dateTimeRange.formToRql(this, selector);

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }
    }

  });
});
