// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/filter'
], function(
  _,
  $,
  time,
  FilterView,
  idAndLabel,
  dateTimeRange,
  orgUnits,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'order',
      'serialNumbers',
      'productFamily',
      'division',
      'line',
      'kind',
      'errorCategory',
      'faultCode',
      'status',
      'inspector',
      'nokOwner',
      'leader',
      'coach',
      'operator',
      'limit'
    ],
    filterMap: {
      orderNo: 'order',
      nc12: 'order',
      correctiveAction: 'status',
      inspectorLeader: 'inspector'
    },

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'mouseup #-result > .btn': function(e)
      {
        var labelEl = e.currentTarget;
        var radioEl = labelEl.firstElementChild;

        if (radioEl.checked)
        {
          setTimeout(function()
          {
            labelEl.classList.remove('active');
            radioEl.checked = false;
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    termToForm: {
      'inspectedAt': dateTimeRange.rqlToForm,
      'ok': function(propertyName, term, formData)
      {
        formData.result = term.args[1] ? 'ok' : 'nok';
      },
      'nc12': function(propertyName, term, formData)
      {
        formData.order = term.args[1].replace(/[^A-Z0-9]+/g, '');
      },
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'productFamily': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'inspector.id': function(propertyName, term, formData)
      {
        formData[propertyName.split('.')[0]] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'orderNo': 'nc12',
      'serialNumbers': 'division',
      'nokOwner.id': 'inspector.id',
      'leader.id': 'inspector.id',
      'coach.id': 'inspector.id',
      'operator.id': 'inspector.id',
      'line': 'inspector.id',
      'kind': 'division',
      'errorCategory': 'division',
      'faultCode': 'productFamily',
      'correctiveActions.status': 'division'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;
      var result = view.getButtonGroupValue('result');
      var order = view.$id('order').val().replace(/[^0-9A-Za-z]+/g, '').toUpperCase();
      var serialNumbers = view.$id('serialNumbers').val().toUpperCase();
      var productFamily = view.$id('productFamily').val();
      var line = view.$id('line').val();
      var faultCode = view.$id('faultCode').val();
      var status = view.$id('status').val();

      dateTimeRange.formToRql(view, selector);

      if (result === 'ok')
      {
        selector.push({name: 'eq', args: ['ok', true]});
      }
      else if (result === 'nok')
      {
        selector.push({name: 'eq', args: ['ok', false]});
      }

      if (order.length === 9)
      {
        selector.push({name: 'eq', args: ['orderNo', order]});
      }
      else if (/^([0-9]{12}|[A-Z][A-Z0-9]{6})$/.test(order))
      {
        selector.push({name: 'eq', args: ['nc12', order]});
      }
      else if (order.length)
      {
        selector.push({name: 'regex', args: ['nc12', '^' + order]});
      }

      if (serialNumbers.length === 19)
      {
        selector.push({name: 'eq', args: ['serialNumbers', serialNumbers]});
      }

      ['inspector', 'nokOwner', 'leader', 'coach', 'operator'].forEach(function(prop)
      {
        var value = view.$id(prop).val();

        if (value.length)
        {
          if (value.indexOf(',') === -1)
          {
            selector.push({name: 'eq', args: [prop + '.id', value]});
          }
          else
          {
            selector.push({name: 'in', args: [prop + '.id', value.split(',')]});
          }
        }
      });

      if (line.length)
      {
        if (line.indexOf(',') === -1)
        {
          selector.push({name: 'eq', args: ['line', line]});
        }
        else
        {
          selector.push({name: 'in', args: ['line', line.split(',')]});
        }
      }

      if (productFamily.length)
      {
        if (productFamily.indexOf(',') === -1)
        {
          selector.push({name: 'eq', args: ['productFamily', productFamily]});
        }
        else
        {
          selector.push({name: 'in', args: ['productFamily', productFamily.split(',')]});
        }
      }

      if (faultCode.length)
      {
        if (faultCode.indexOf(',') === -1)
        {
          selector.push({name: 'eq', args: ['faultCode', faultCode]});
        }
        else
        {
          selector.push({name: 'in', args: ['faultCode', faultCode.split(',')]});
        }
      }

      if (status.length)
      {
        selector.push({name: 'eq', args: ['correctiveActions.status', status]});
      }

      ['division', 'kind', 'errorCategory'].forEach(function(property)
      {
        var value = view.$id(property).val();

        if (value)
        {
          selector.push({name: 'eq', args: [property, value]});
        }
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('result');

      this.$id('filters').select2({
        width: '175px'
      });

      this.$id('productFamily').select2({
        width: '200px',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: dictionaries.productFamilies.map(function(d) { return {id: d, text: d}; })
      });

      this.$id('division').select2({
        width: '80px',
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getAllByType('division')
          .filter(function(d)
          {
            return d.get('type') === 'prod' || d.get('type') === 'dist';
          })
          .map(idAndLabel)
      });

      this.$id('line').select2({
        width: '175px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getAllByType('prodLine')
          .filter(function(d) { return !d.get('deactivatedAt'); })
          .map(idAndLabel)
      });

      this.$id('kind').select2({
        width: '200px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.kinds.map(idAndLabel)
      });

      this.$id('errorCategory').select2({
        width: '140px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.errorCategories.map(idAndLabel)
      });

      this.$id('faultCode').select2({
        width: '195px',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: dictionaries.faults.map(idAndLabel)
      });

      this.$id('status').select2({
        width: '125px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.actionStatuses.map(idAndLabel)
      });

      this.$id('inspector').select2({
        width: '230px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.inspectors.map(idAndLabel)
      });

      this.$id('nokOwner').select2({
        width: '230px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.masters.map(idAndLabel)
      });

      this.$id('leader').select2({
        width: '230px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.leaders.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('coach'), {
        view: this,
        width: '230px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        noPersonnelId: true
      });

      setUpUserSelect2(this.$id('operator'), {
        view: this,
        width: '230px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        noPersonnelId: true
      });
    },

    showFilter: function(filter)
    {
      if (filter === 'inspectedAt')
      {
        this.$id('from-date').focus();

        return;
      }

      FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
