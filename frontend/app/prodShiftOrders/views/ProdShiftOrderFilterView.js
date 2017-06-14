// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'select2',
  'app/user',
  'app/data/mrpControllers',
  'app/data/prodLines',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/prodShiftOrders/templates/filter'
], function(
  _,
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
      'prodLine': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'shift': 'prodLine'
    },

    events: _.assign({

      'focus .prodShiftOrders-filter-orderId': function(e)
      {
        var $input = this.$(e.currentTarget);
        var $group = $input.closest('.form-group');
        var $textarea = $('<textarea class="form-control" rows="4"></textarea>')
          .css({
            position: 'absolute',
            marginTop: '-34px',
            width: '383px',
            zIndex: '2'
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

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

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
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var mrp = this.$id('mrp').val();
      var prodLine = this.$id('prodLine').val();
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);

      this.serializeOrderId(selector);
      this.serializeBom(selector);

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
