// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/xiconf/templates/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
  idAndLabel,
  orgUnits,
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
        result: ['success', 'failure']
      };
    },

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'result': function(propertyName, term, formData)
      {
        if (term.args[1] === 'success' || term.args[1] === 'failure')
        {
          formData.result = [term.args[1]];
        }
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'search': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1] === '__FT__' ? 'FT' : term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('result');

      this.$id('prodLine').select2({
        width: '200px',
        placeholder: ' ',
        allowClear: true,
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var prodLine = this.$id('prodLine').val();
      var search = this.$id('search').val().trim().toUpperCase();
      var result = this.getButtonGroupValue('result');

      dateTimeRange.formToRql(this, selector);

      if (prodLine)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (search)
      {
        selector.push({name: 'eq', args: ['search', search === 'FT' ? '__FT__' : search]});
      }

      if (result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', result[0]]});
      }
    }

  });
});
