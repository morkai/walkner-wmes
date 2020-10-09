// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  'app/wh-lines/templates/snapshotFilter'
], function(
  FilterView,
  idAndLabel,
  dateTimeRange,
  orgUnits,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'time': dateTimeRange.rqlToForm,
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = Array.isArray(term.args[1]) ? term.args[1].join(',') : term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('line').select2({
        width: '175px',
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var line = this.$id('line').val();

      dateTimeRange.formToRql(this, selector);

      if (line)
      {
        selector.push({name: 'eq', args: ['line', line]});
      }
    }

  });
});
