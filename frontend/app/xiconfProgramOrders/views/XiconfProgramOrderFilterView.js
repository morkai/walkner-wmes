// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/xiconfProgramOrders/templates/filter'
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
        no: '',
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
        formData.no = term.args[1];
      },
      'status': function(propertyName, term, formData)
      {
        formData.status = (term.name === 'eq' ? [term.args[1]] : term.args[1]);
      },
      'nc12._id': function(propertyName, term, formData)
      {
        formData.nc12 = term.args[1];
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
      var no = this.$id('no').val().trim();
      var nc12 = this.$id('nc12').val().trim();
      var status = this.getButtonGroupValue('status').map(Number);

      if (/^[0-9]{9}$/.test(no))
      {
        selector.push({name: 'eq', args: ['_id', no]});
      }

      if (/^[0-9]{12}$/.test(nc12))
      {
        selector.push({name: 'eq', args: ['nc12._id', nc12]});
      }

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
