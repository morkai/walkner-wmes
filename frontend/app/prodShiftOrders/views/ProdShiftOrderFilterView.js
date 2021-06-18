// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'select2',
  'app/user',
  'app/data/mrpControllers',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/prodShiftOrders/templates/filter'
], function(
  _,
  $,
  select2,
  user,
  mrpControllers,
  FilterView,
  dateTimeRange,
  OrgUnitPickerView,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'shift',
      'orderId',
      'product',
      'bom',
      'mrp',
      'orgUnit',
      'mechOrder',
      'limit'
    ],
    filterMap: {
      mrpControllers: 'mrp',
      prodFlow: 'orgUnit',
      prodLine: 'orgUnit',
      order: 'orderId',
      prodShift: 'shift'
    },

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'focus .prodShiftOrders-filter-orderId': function(e)
      {
        var $input = this.$(e.currentTarget);
        var $group = $input.closest('.form-group');
        var $textarea = $('<textarea class="form-control" rows="4"></textarea>')
          .css({
            position: 'absolute',
            marginTop: '-34px',
            width: '383px',
            zIndex: '3'
          })
          .val($input.val().split(' ').join('\n'))
          .appendTo($group)
          .focus();

        $textarea.on('blur', function()
        {
          $input.val($textarea.val().split('\n').join(' ')).prop('disabled', false);
          $textarea.remove();
        });

        $input[0].disabled = true;
      }

    }, FilterView.prototype.events),

    defaultFormData: {
      mrp: '',
      type: null,
      shift: 0,
      orderId: '',
      bom: '',
      mechOrder: false
    },

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'orderData.mrp': function(propertyName, term, formData)
      {
        formData.mrp = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      },
      'orderId': function(propertyName, term, formData)
      {
        var value = term.args[1];
        var filter = formData[propertyName];

        if (term.name === 'all')
        {
          filter += ' ' + value.join('+');
        }
        else if (term.name === 'in')
        {
          filter += ' ' + value.join(',');
        }
        else
        {
          filter += ' ' + value;
        }

        formData[propertyName] = filter.trim();
      },
      'orderData.bom.nc12': function(propertyName, term, formData)
      {
        var value = term.args[1];
        var filter = formData.bom;

        if (term.name === 'all')
        {
          filter += ' ' + value.join('+');
        }
        else if (term.name === 'in')
        {
          filter += ' ' + value.join(',');
        }
        else
        {
          filter += ' ' + value;
        }

        formData.bom = filter.trim();
      },
      'orderData.bom.item': 'orderData.bom.nc12',
      'orderData.nc12': function(propertyName, term, formData)
      {
        formData.product = term.args[1];
      },
      'orderData.description': function(propertyName, term, formData)
      {
        formData.product = this.unescapeRegExp(term.args[1].substring(1));
      },
      'shift': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'mechOrder': 'shift'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('shift');
      this.toggleButtonGroup('mechOrder');

      setUpMrpSelect2(this.$id('mrp'), {own: true, view: this});
    },

    serializeOrderId: function(selector)
    {
      var groups = this.$id('orderId')
        .val()
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*\+\s*/g, '+')
        .toUpperCase()
        .split(' ');
      var $all = {};
      var $in = {};

      groups.forEach(function(group)
      {
        var cond = $in;
        var op = ',';

        if (_.includes(group, '+'))
        {
          cond = $all;
          op = '+';
        }

        group.split(op).forEach(function(orderId)
        {
          orderId = orderId.replace(/[^0-9A-Z]+/g, '');

          if (orderId.length)
          {
            cond[orderId] = 1;
          }
        });
      });

      $all = _.keys($all);
      $in = _.keys($in);

      if ($all.length)
      {
        selector.push({name: 'all', args: ['orderId', $all]});
      }

      if ($in.length)
      {
        selector.push({name: 'in', args: ['orderId', $in]});
      }
    },

    serializeBom: function(selector)
    {
      var groups = this.$id('bom')
        .val()
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*\+\s*/g, '+')
        .toUpperCase()
        .split(' ');
      var $all = {
        nc12: {},
        item: {}
      };
      var $in = {
        nc12: {},
        item: {}
      };

      groups.forEach(function(group)
      {
        var cond = $in;
        var op = ',';

        if (_.includes(group, '+'))
        {
          cond = $all;
          op = '+';
        }

        var parts = group
          .split(op)
          .map(function(part) {return part.replace(/[^0-9A-Z]+/g, ''); })
          .filter(function(part)
          {
            return /^([0-9]{1,4}|[0-9A-Z]{6,12})$/.test(part);
          });

        if (!parts.length)
        {
          return;
        }

        cond = parts[0].length <= 4 ? cond.item : cond.nc12;

        parts.forEach(function(part)
        {
          while (part.length < 4)
          {
            part = '0' + part;
          }

          cond[part] = 1;
        });
      });

      ['nc12', 'item'].forEach(function(prop)
      {
        $all[prop] = _.keys($all[prop]);
        $in[prop] = _.keys($in[prop]);

        if ($all[prop].length)
        {
          selector.push({name: 'all', args: ['orderData.bom.' + prop, $all[prop]]});
        }

        if ($in[prop].length)
        {
          selector.push({name: 'in', args: ['orderData.bom.' + prop, $in[prop]]});
        }
      });
    },

    serializeFormToQuery: function(selector)
    {
      this.serializeOrderId(selector);
      this.serializeBom(selector);

      dateTimeRange.formToRql(this, selector);

      var product = this.$id('product').val();

      if (product)
      {
        if (product.length === 12)
        {
          selector.push({name: 'eq', args: ['orderData.nc12', product]});
        }
        else
        {
          selector.push({name: 'regex', args: [
            'orderData.description',
            '^' + this.escapeRegExp(product.toUpperCase())
          ]});
        }
      }

      var mrp = this.$id('mrp').val();

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['orderData.mrp', mrp.split(',')]});
      }

      var shift = parseInt(this.$('input[name="shift"]:checked').val(), 10);

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      selector.push({name: 'eq', args: [
        'mechOrder',
        this.$('input[name="mechOrder"]:checked').val() === 'true'
      ]});
    },

    showFilter: function(filter)
    {
      if (filter === 'startedAt')
      {
        this.$id('from-date').focus();

        return;
      }

      FilterView.prototype.showFilter.apply(this, arguments);
    },

    filterHasValue: function(filter)
    {
      if (filter === 'mechOrder')
      {
        return this.getButtonGroupValue(filter) === 'true';
      }

      return FilterView.prototype.filterHasValue.apply(this, arguments);
    }

  });
});
