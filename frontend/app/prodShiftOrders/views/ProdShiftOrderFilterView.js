// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'select2',
  'app/user',
  'app/data/mrpControllers',
  'app/data/prodLines',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/prodShiftOrders/templates/filter'
], function(
  $,
  select2,
  user,
  mrpControllers,
  prodLines,
  FilterView,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      from: '',
      to: '',
      mrp: '',
      prodLine: null,
      type: null,
      shift: 0,
      orderId: '',
      bom: ''
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      'orderData.mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(',');
      },
      'orderId': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(', ') : term.args[1];
      },
      'orderData.bom.nc12': function(propertyName, term, formData)
      {
        formData.bom = term.name === 'in' ? term.args[1].join(', ') : term.args[1];
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'shift': 'prodLine'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('mrp').select2({
        width: '325px',
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

      this.$id('prodLine').select2({
        width: '175px',
        allowClear: !user.getDivision(),
        data: this.getApplicableProdLines(),
        formatResult: function(item, $container, query, e)
        {
          if (!item.id)
          {
            return e(item.text);
          }

          var html = [];

          html.push('<span style="text-decoration: ' + (item.deactivatedAt ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        },
        formatSelection: function(item)
        {
          return item.deactivatedAt
            ? ('<span style="text-decoration: line-through">' + item.id + '</span>')
            : item.id;
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

    getApplicableProdLines: function()
    {
      return prodLines.getForCurrentUser().map(function(prodLine)
      {
        return {
          id: prodLine.id,
          text: prodLine.getLabel(),
          deactivatedAt: prodLine.get('deactivatedAt')
        };
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var mrp = this.$id('mrp').val();
      var prodLine = this.$id('prodLine').val();
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var orderId = this.$id('orderId')
        .val()
        .toUpperCase()
        .split(/[^0-9A-Z]+/)
        .filter(function(v) { return v.length; });
      var bom = this.$id('bom')
        .val()
        .toUpperCase()
        .split(/[^0-9A-Z]+/)
        .filter(function(v) { return v.length === 7 || v.length === 12; });

      if (orderId.length === 1)
      {
        selector.push({name: 'eq', args: ['orderId', orderId[0]]});
      }
      else if (orderId.length)
      {
        selector.push({name: 'in', args: ['orderId', orderId]});
      }

      if (bom.length === 1)
      {
        selector.push({name: 'eq', args: ['orderData.bom.nc12', bom[0]]});
      }
      else if (bom.length)
      {
        selector.push({name: 'in', args: ['orderData.bom.nc12', bom]});
      }

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['orderData.mrp', mrp.split(',')]});
      }

      if (prodLine && prodLine.length)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['startedAt', timeRange.to]});
      }
    }

  });
});
