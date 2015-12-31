// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/vendors/util/setUpVendorSelect2',
  'app/purchaseOrders/templates/filter'
], function(
  user,
  FilterView,
  fixTimeRange,
  setUpVendorSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      _id: '',
      vendor: '',
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
      'vendor': function(propertyName, term, formData)
      {
        formData.vendor = term.args[1];
      },
      'open': function(propertyName, term, formData)
      {
        formData.status = [term.args[1] ? 'open' : 'closed'];
      },
      'scheduledAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date', {utc: true});
      },
      'items.nc12': '_id'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      if (!user.data.vendor)
      {
        var vendor = this.$id('vendor').val();

        if (vendor)
        {
          vendor = {id: vendor, text: vendor};
        }

        setUpVendorSelect2(this.$id('vendor'), {width: 250}).select2('data', vendor);
      }

      this.toggleButtonGroup('status');
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {utc: true});
      var status = this.getStatus();
      var vendor = this.$id('vendor').val();

      if (vendor)
      {
        selector.push({name: 'eq', args: ['vendor', vendor]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['scheduledAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['scheduledAt', timeRange.to]});
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
