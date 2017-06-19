// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/fixTimeRange',
  'app/isa/templates/requestListFilter'
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
      requestedAt: '',
      line: null
    },

    termToForm: {
      'requestedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData.line = term.args[1];
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
