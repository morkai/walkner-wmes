// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  '../dictionaries',
  'app/wmes-trw-tests/templates/filter'
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

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'workstation': 'line',
      'order': 'line',
      'tester': 'line',
      'program._id': function(propertyName, term, formData)
      {
        formData.program = term.args[1];
      },
      'program.base._id': function(propertyName, term, formData)
      {
        formData.base = term.args[1];
      },
      'program.base.tester._id': function(propertyName, term, formData)
      {
        formData.tester = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var props = {
        program: 'program._id',
        base: 'program.base._id',
        tester: 'program.base.tester._id'
      };

      dateTimeRange.formToRql(this, selector);

      ['line', 'workstation', 'order', 'program', 'base', 'tester'].forEach(function(prop)
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

      this.$id('line').select2({
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

      this.$id('base').select2({
        width: '170px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.bases.map(idAndLabel)
      });

      this.$id('tester').select2({
        width: '170px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.testers.map(idAndLabel)
      });
    }

  });
});
