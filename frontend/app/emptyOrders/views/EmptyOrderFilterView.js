// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/emptyOrders/templates/filter'
], function(
  _,
  FilterView,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.assign({}, FilterView.prototype.events, {
      'change #-from': function(e)
      {
        var $to = this.$id('to');

        if ($to.attr('data-changed') !== 'true')
        {
          $to.val(e.target.value);
        }
      },
      'change #-to': function(e)
      {
        e.target.setAttribute('data-changed', 'true');
      }
    }),

    defaultFormData: {
      _id: '',
      date: 'startDate',
      from: '',
      to: ''
    },

    termToForm: {
      'startDate': function(propertyName, term, formData)
      {
        formData.date = propertyName;

        fixTimeRange.toFormData(formData, term, 'date');
      },
      '_id': function(propertyName, term, formData)
      {
        var value = term.args[1];

        formData[propertyName] = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : '-';
      },
      'finishDate': 'startDate'
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var date = this.$('[name=date]:checked').val();

      this.serializeRegexTerm(selector, '_id', 9);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: [date, timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: [date, timeRange.to]});
      }
    }

  });
});
