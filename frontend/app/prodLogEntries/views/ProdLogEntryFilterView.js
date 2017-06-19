// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/data/prodLines',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/prodLogEntries/templates/filter'
], function(
  user,
  prodLines,
  FilterView,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      createdAt: '',
      prodLine: null,
      type: null
    },

    termToForm: {
      'createdAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'type': 'prodLine'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('prodLine').select2({
        width: '275px',
        allowClear: true,
        data: this.getApplicableProdLines()
      });

      this.$id('type').select2({
        width: '275px',
        allowClear: true
      });
    },

    getApplicableProdLines: function()
    {
      return prodLines.getForCurrentUser().map(function(prodLine)
      {
        return {
          id: prodLine.id,
          text: prodLine.getLabel()
        };
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var prodLine = this.$id('prodLine').val();
      var type = this.$id('type').val();

      if (prodLine && prodLine.length)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['createdAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['createdAt', timeRange.to]});
      }
    }

  });
});
