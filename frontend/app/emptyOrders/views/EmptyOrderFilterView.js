// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    events: _.extend({}, FilterView.prototype.events, {
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
