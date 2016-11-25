// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/prodLines',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/core/util/idAndLabel',
  'app/prodSerialNumbers/templates/filter'
], function(
  prodLines,
  FilterView,
  fixTimeRange,
  idAndLabel,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      orderNo: '',
      prodLine: '',
      scannedAt: ''
    },

    termToForm: {
      'scannedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'orderNo': 'prodLine'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('prodLine').select2({
        width: '275px',
        allowClear: true,
        placeholder: ' ',
        data: prodLines.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['scannedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['scannedAt', timeRange.to]});
      }

      ['_id', 'orderNo', 'prodLine'].forEach(function(p)
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
