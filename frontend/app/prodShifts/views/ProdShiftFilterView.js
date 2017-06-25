// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodShifts/templates/filter'
], function(
  user,
  FilterView,
  fixTimeRange,
  OrgUnitPickerView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      date: '',
      shift: 0
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      'shift': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var shift = parseInt(this.$('input[name="shift"]:checked').val(), 10);

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['date', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['date', timeRange.to]});
      }
    }

  });
});
