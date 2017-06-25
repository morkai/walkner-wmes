// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodSerialNumbers/templates/filter'
], function(
  FilterView,
  fixTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      orderNo: '',
      scannedAt: ''
    },

    termToForm: {
      'scannedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'orderNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        orgUnitTypes: ['prodLine'],
        filterView: this
      }));
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['scannedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['scannedAt', timeRange.to]});
      }

      ['_id', 'orderNo'].forEach(function(p)
      {
        var value = this.$id(p).val().trim();

        if (value && value.length)
        {
          selector.push({name: 'eq', args: [p, value]});
        }
      }, this);
    }

  });
});
