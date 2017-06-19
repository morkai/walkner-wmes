// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/xiconfOrders/templates/filter'
], function(
  time,
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        from: '',
        to: '',
        _id: '',
        nc12: '',
        status: [-1, 0, 1]
      };
    },

    termToForm: {
      'reqDate': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
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
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var status = this.getButtonGroupValue('status').map(Number);

      this.serializeRegexTerm(selector, '_id', 9, null, false, true);
      this.serializeRegexTerm(selector, 'nc12', 12, null, false, true);

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['reqDate', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['reqDate', toMoment.valueOf()]});
      }

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
