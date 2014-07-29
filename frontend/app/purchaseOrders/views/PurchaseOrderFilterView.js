// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/purchaseOrders/templates/filter'
], function(
  FilterView,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      _id: '',
      'items.nc12': '',
      from: '',
      to: '',
      status: ['open', 'closed']
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = typeof term.args[1] === 'string' ? term.args[1].replace(/[^0-9]+/g, '') : '';
      },
      'open': function(propertyName, term, formData)
      {
        formData.status = [term.args[1] ? 'open' : 'closed'];
      },
      'items.schedule.date': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      'items.nc12': '_id'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var status = this.getStatus();

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['items.schedule.date', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['items.schedule.date', timeRange.to]});
      }

      if (status !== null)
      {
        selector.push({name: 'eq', args: ['open', status]});
      }

      this.serializeRegexTerm(selector, '_id', 6);
      this.serializeRegexTerm(selector, 'items.nc12', 12);
    },

    getStatus: function()
    {
      var $all = this.$('[name="status[]"]');
      var $allChecked = $all.filter(':checked');

      if ($allChecked.length === 0)
      {
        $allChecked = $all.prop('checked', true);

        this.toggleButtonGroup('status');
      }

      if ($allChecked.length === 2)
      {
        return null;
      }

      return $allChecked[0].value === 'open';
    }

  });
});
