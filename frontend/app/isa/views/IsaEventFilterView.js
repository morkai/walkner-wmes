// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/fixTimeRange',
  'app/isa/templates/eventListFilter'
], function(
  orgUnits,
  FilterView,
  idAndLabel,
  fixTimeRange,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      time: '',
      line: null,
      type: null
    },

    termToForm: {
      'time': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData.line = term.args[1];
      },
      'type': function(propertyName, term, formData)
      {
        formData.type = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('line').select2({
        width: '275px',
        allowClear: true,
        placeholder: ' ',
        data: this.getApplicableProdLines()
      });

      this.$id('type').select2({
        width: '275px',
        allowClear: true,
        placeholder: ' '
      });
    },

    getApplicableProdLines: function()
    {
      return orgUnits
        .getAllByType('prodLine')
        .filter(function(prodLine)
        {
          var subdivision = orgUnits.getSubdivisionFor(prodLine);

          return !subdivision || subdivision.get('type') === 'assembly';
        })
        .map(idAndLabel);
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '00:00'});
      var line = this.$id('line').val();
      var type = this.$id('type').val();

      if (line && line.length)
      {
        selector.push({name: 'orgUnit', args: ['prodLine', line]});
      }

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['time', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['time', timeRange.to]});
      }
    }

  });
});
