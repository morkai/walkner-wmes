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
      id: '',
      idType: '_id',
      mrp: '',
      statusesIn: '',
      statusesNin: ''
    },

    filterList: [
      'mrp',
      'delayReason',
      'statusesIn',
      'statusesNin',
      'limit'
    ],

    filterMap: {
      '_id': 'id',
      'nc12': 'id'
    },

    termToForm: {
      'scheduledStartDate': dateTimeRange.rqlToForm,
      '_id': function(propertyName, term, formData)
      {
        formData.id = Array.isArray(term.args[1]) ? term.args[1].join(' ') : term.args[1];
        formData.idType = propertyName;
      },
      'nc12': '_id',
      'bom.nc12': '_id',
      'documents.nc15': '_id',
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(',');
      },
      'delayReason': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'statuses': function(propertyName, term, formData)
      {
        formData[term.name === 'all' ? 'statusesIn' : 'statusesNin'] = term.args[1].join(',');
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpMrpSelect2(this.$id('mrp'), {own: true, view: this});

      this.$id('delayReason').select2({
        width: '250px',
        allowClear: true,
        placeholder: ' ',
        data: this.delayReasons.map(idAndLabel)
      });

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
      var id = this.$id('id')
        .val()
        .trim()
        .toUpperCase()
        .split(/[^A-Z0-9]+/)
        .filter(function(v) { return /^([A-Z0-9]{7}|[0-9]{9}|[0-9]{12}|[0-9]{15})$/.test(v); });
      var idType = this.$('input[name="idType"]:checked').val();
      var mrp = this.$id('mrp').val();
      var delayReason = this.$id('delayReason').val();
      var statusesIn = this.$id('statusesIn').val();
      var statusesNin = this.$id('statusesNin').val();

      dateTimeRange.formToRql(this, selector);

      if (id.length)
      {
        selector.push({name: 'in', args: [idType, id]});
      }

      if (mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      if (delayReason.length)
      {
        selector.push({name: 'eq', args: ['delayReason', delayReason]});
      }

      if (statusesIn.length)
      {
        selector.push({name: 'all', args: ['statuses', statusesIn.split(',')]});
      }

      if (statusesNin.length)
      {
        selector.push({name: 'nin', args: ['statuses', statusesNin.split(',')]});
      }
    },

    showFilter: function(filter)
    {
      if (filter === 'statuses')
      {
        this.showFilter('statusesNin');
        this.showFilter('statusesIn');

        return;
      }

      if (filter === '_id' || filter === 'nc12')
      {
        this.$('input[name="idType"][value="' + filter + '"]').click();
        this.$id('id').focus();

        return;
      }

      FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
