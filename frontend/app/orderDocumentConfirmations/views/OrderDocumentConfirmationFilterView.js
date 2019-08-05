// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/orderDocumentConfirmations/templates/filter'
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

    defaultFormData: function()
    {
      return {
        line: ''
      };
    },

    termToForm: {
      'time': dateTimeRange.rqlToForm,
      'line': function(propertyName, term, formData)
      {
        formData.line = term.args[1];
      },
      'nc15': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'orderNo': 'nc15'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        filterView: this,
        orgUnitTypes: ['prodLine'],
        orgUnitTerms: {
          line: 'prodLine'
        }
      }));
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      ['nc15', 'orderNo'].forEach(function(p)
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
