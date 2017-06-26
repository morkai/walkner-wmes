// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'select2',
  'app/user',
  'app/data/mrpControllers',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodShifts/templates/filter'
], function(
  $,
  select2,
  user,
  mrpControllers,
  FilterView,
  fixTimeRange,
  OrgUnitPickerView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      date: '',
      shift: 0,
      orderMrp: ''
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      'shift': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'orderMrp': function(propertyName, term, formData)
      {
        formData[propertyName] = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('shift');

      this.$id('orderMrp').select2({
        width: '300px',
        multiple: true,
        allowClear: true,
        data: this.getApplicableMrps(),
        matcher: function(term, text, option)
        {
          return $().select2.defaults.matcher(term, option.id) || $().select2.defaults.matcher(term, text);
        },
        formatResult: function(item, $container, query, e)
        {
          if (!item.id)
          {
            return e(item.text);
          }

          var html = [];

          select2.util.markMatch(item.id, query.term, html, e);
          html.push(': ');
          select2.util.markMatch(item.text, query.term, html, e);

          return html.join('');
        },
        formatSelection: function(item)
        {
          return item.id;
        }
      });
    },

    getApplicableMrps: function()
    {
      return mrpControllers.getForCurrentUser()
        .filter(function(mrp) { return !mrp.get('deactivatedAt'); })
        .map(function(mrp)
        {
          return {
            id: mrp.id,
            text: mrp.get('description')
          };
        });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var shift = parseInt(this.$('input[name="shift"]:checked').val(), 10);
      var orderMrp = this.$id('orderMrp').val();

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['date', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['date', timeRange.to]});
      }

      if (orderMrp && orderMrp.length)
      {
        selector.push({name: 'in', args: ['orderMrp', orderMrp.split(',')]});
      }
    }

  });
});
