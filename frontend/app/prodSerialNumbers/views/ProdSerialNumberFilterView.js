// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodSerialNumbers/templates/filter'
], function(
  _,
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

    defaultFormData: {
      _id: '',
      orderNo: ''
    },

    termToForm: {
      'scannedAt': dateTimeRange.rqlToForm,
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

      this.setView('#-orgUnit', new OrgUnitPickerView({
        orgUnitTypes: ['prodLine'],
        filterView: this
      }));
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

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
