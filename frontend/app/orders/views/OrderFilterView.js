// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/core/views/FilterView',
  'app/data/orderStatuses',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/orders/templates/filter'
], function(
  _,
  idAndLabel,
  dateTimeRange,
  FilterView,
  orderStatuses,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: {
      _id: '',
      nc12: '',
      mrp: '',
      statuses: ''
    },

    termToForm: {
      'scheduledStartDate': dateTimeRange.rqlToForm,
      '_id': function(propertyName, term, formData)
      {
        var value = term.args[1];

        formData[propertyName] = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : '-';
      },
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(',');
      },
      'statuses': function(propertyName, term, formData)
      {
        formData[term.name === 'all' ? 'statusesIn' : 'statusesNin'] = term.args[1].join(',');
      },
      'nc12': '_id'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpMrpSelect2(this.$id('mrp'), {own: true, view: this});

      this.$id('statusesIn').select2({
        width: '200px',
        multiple: true,
        data: orderStatuses.map(idAndLabel)
      });

      this.$id('statusesNin').select2({
        width: '200px',
        multiple: true,
        data: orderStatuses.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var mrp = this.$id('mrp').val();
      var statusesIn = this.$id('statusesIn').val();
      var statusesNin = this.$id('statusesNin').val();

      dateTimeRange.formToRql(this, selector);

      this.serializeRegexTerm(selector, '_id', 9, null, false, true);
      this.serializeRegexTerm(selector, 'nc12', 12, null, false, true);

      if (mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      if (statusesIn.length)
      {
        selector.push({name: 'all', args: ['statuses', statusesIn.split(',')]});
      }

      if (statusesNin.length)
      {
        selector.push({name: 'nin', args: ['statuses', statusesNin.split(',')]});
      }
    }

  });
});
