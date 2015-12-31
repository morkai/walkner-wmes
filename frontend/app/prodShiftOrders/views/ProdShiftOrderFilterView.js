// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/data/prodLines',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/prodShiftOrders/templates/filter'
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
      from: '',
      to: '',
      prodLine: null,
      type: null,
      shift: 0,
      orderId: '',
      operationNo: ''
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'shift': 'prodLine',
      'orderId': 'prodLine',
      'operationNo': 'prodLine'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('prodLine').select2({
        width: '275px',
        allowClear: !user.getDivision(),
        data: this.getApplicableProdLines()
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
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var orderId = this.$id('orderId').val();
      var operationNo = this.fixOperationNo();

      if (orderId && orderId.length)
      {
        selector.push({name: 'eq', args: ['orderId', orderId]});
      }

      if (prodLine && prodLine.length)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      if (operationNo && operationNo.length)
      {
        selector.push({name: 'eq', args: ['operationNo', operationNo]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['startedAt', timeRange.to]});
      }
    },

    fixOperationNo: function()
    {
      var $operationNo = this.$id('operationNo');
      var operationNo = $operationNo.val().trim();

      if (operationNo.length > 0)
      {
        while (operationNo.length < 4)
        {
          operationNo = '0' + operationNo;
        }
      }

      $operationNo.val(operationNo);

      return operationNo;
    }

  });
});
