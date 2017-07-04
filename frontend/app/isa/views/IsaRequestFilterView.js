// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/isa/templates/requestListFilter'
], function(
  orgUnits,
  FilterView,
  idAndLabel,
  fixTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      requestedAt: ''
    },

    termToForm: {
      'requestedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        mode: 'array',
        filterView: this
      }));
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '00:00'});
      var line = this.$id('line').val();

      if (line && line.length)
      {
        selector.push({name: 'orgUnit', args: ['prodLine', line]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['requestedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['requestedAt', timeRange.to]});
      }
    }

  });
});
