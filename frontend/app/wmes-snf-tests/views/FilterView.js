// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  '../dictionaries',
  'app/wmes-snf-tests/templates/filter'
], function(
  _,
  FilterView,
  idAndLabel,
  dateTimeRange,
  orgUnits,
  dictionaries,
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
        result: ['true', 'false']
      };
    },

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'orderNo': 'prodLine',
      'program._id': function(propertyName, term, formData)
      {
        formData.program = term.args[1];
      },
      'result': function(propertyName, term, formData)
      {
        if (typeof term.args[1] === 'boolean')
        {
          formData.result = [term.args[1].toString()];
        }
      }
    },

    serializeFormToQuery: function(selector)
    {
      var result = this.getButtonGroupValue('result');

      if (result.length === 1)
      {
        selector.push({
          name: 'eq',
          args: ['result', result[0] === 'true']
        });
      }
      var props = {
        program: 'program._id'
      };

      dateTimeRange.formToRql(this, selector);

      ['prodLine', 'orderNo', 'program'].forEach(function(prop)
      {
        var value = this.$id(prop).val();

        if (value)
        {
          selector.push({name: 'eq', args: [props[prop] || prop, /^[0-9]+$/.test(value) ? +value : value]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('prodLine').select2({
        width: '170px',
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });

      this.$id('program').select2({
        width: '230px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.programs.map(idAndLabel)
      });

      this.toggleButtonGroup('result');
    }

  });
});
