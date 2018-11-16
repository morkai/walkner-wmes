// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/xiconfOrders/templates/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
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
        _id: '',
        nc12: '',
        status: [-1, 0, 1]
      };
    },

    termToForm: {
      'reqDate': dateTimeRange.rqlToForm,
      '_id': function(propertyName, term, formData)
      {
        formData._id = term.args[1].replace(/[^0-9]/g, '');
      },
      'status': function(propertyName, term, formData)
      {
        formData.status = (term.name === 'eq' ? [term.args[1]] : term.args[1]);
      },
      'nc12': function(propertyName, term, formData)
      {
        formData.nc12 = term.args[1].replace(/[^0-9A-Za-z]/g, '');
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status').map(Number);

      dateTimeRange.formToRql(this, selector);

      this.serializeRegexTerm(selector, '_id', 9, null, false, true);
      this.serializeRegexTerm(selector, 'nc12', 12, null, false, true);

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length === 2)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
    }

  });
});
