// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'select2',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/lineFreezeOrdersDialog'
], function(
  _,
  $,
  select2,
  form2js,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'planning',

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'change #-availableOrders': function(e)
      {
        this.addOrder(e.added.id);

        this.$id('availableOrders').select2('data', null);

        setTimeout(function(view) { view.$('.planning-freezeOrders-quantity').last().select(); }, 1, this);
      },

      'keydown .planning-freezeOrders-quantity': function(e)
      {
        if (e.keyCode !== 13)
        {
          return;
        }

        var $next = this.$(e.currentTarget).closest('tr').next();

        if ($next.length)
        {
          $next.find('.planning-freezeOrders-quantity').select();
        }
        else
        {
          this.$('.planning-freezeOrders-quantity').first().select();
        }

        return false;
      },

      'click .btn[data-action="remove"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var view = this;

        $tr.fadeOut('fast', function()
        {
          $(this).remove();
          view.recountOrders();
        });
      },

      'click .btn[data-action="up"]': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $prevTr = $thisTr.prev();

        if ($prevTr.length)
        {
          $thisTr.insertBefore($prevTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertAfter($childTrs.last());
          }
        }

        this.recountOrders();

        $btn.focus();
      },

      'click .btn[data-action="down"]': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $nextTr = $thisTr.next();

        if ($nextTr.length)
        {
          $thisTr.insertAfter($nextTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertBefore($childTrs.first());
          }
        }

        this.recountOrders();

        $btn.focus();
      },

      'click .btn[data-shift]': function(e)
      {
        var view = this;

        view.$id('frozenOrders').html('');

        var shift = +e.currentTarget.dataset.shift;
        var frozenOrders = [];
        var quantities = {};

        view.line.orders.forEach(function(lineOrder)
        {
          var orderNo = lineOrder.get('orderNo');
          var quantity = lineOrder.get('quantity');
          var lineOrderShift = lineOrder.getShiftNo();

          if (quantities[orderNo])
          {
            quantities[orderNo] += quantity;
          }
          else if (lineOrderShift <= shift)
          {
            frozenOrders.push(orderNo);

            quantities[orderNo] = quantity;
          }
        });

        frozenOrders.forEach(function(orderNo)
        {
          view.addOrder(orderNo, quantities[orderNo]);
        });
      }

    },

    initialize: function()
    {
      this.nextOrderIndex = 0;
      this.$frozenOrder = null;
    },

    getTemplateData: function()
    {
      return {
        mrp: this.mrp.getLabel(),
        line: this.line.getLabel()
      };
    },

    serializeAvailableOrders: function()
    {
      var view = this;
      var orders = [];

      view.line.settings.get('mrpPriority').forEach(function(mrpId)
      {
        view.plan.orders.forEach(function(order)
        {
          if (order.get('mrp') === mrpId)
          {
            orders.push({
              id: order.id,
              text: order.get('name')
            });
          }
        });
      });

      return orders;
    },

    afterRender: function()
    {
      var view = this;

      view.$frozenOrder = view.$id('frozenOrders').children().first().detach();

      view.setUpAvailableOrdersSelect2();

      view.line.get('frozenOrders').forEach(function(frozenOrder)
      {
        view.addOrder(frozenOrder.orderNo, frozenOrder.quantity);
      });
    },

    setUpAvailableOrdersSelect2: function()
    {
      this.$id('availableOrders').select2({
        multiple: true,
        data: this.serializeAvailableOrders(),
        matcher: function(term, text, item)
        {
          term = term.toUpperCase();

          return item.id.toUpperCase().indexOf(term) >= 0
            || item.text.toUpperCase().indexOf(term) >= 0;
        },
        formatSelection: function(item)
        {
          return _.escape(item.id);
        },
        formatResult: function(item, $container, query, e)
        {
          var html = ['<span class="text-mono">'];

          select2.util.markMatch(item.id, query.term, html, e);

          if (item.text === '')
          {
            html.push('</span>');
          }
          else
          {
            html.push('</span> <span class="text-small">');
            select2.util.markMatch(item.text, query.term, html, e);
            html.push('</span>');
          }

          return html.join('');
        }
      });
    },

    addOrder: function(orderNo, quantity)
    {
      var order = this.plan.orders.get(orderNo);

      if (!order)
      {
        return;
      }

      var $frozenOrders = this.$id('frozenOrders');
      var $frozenOrder = this.$frozenOrder.clone();
      var $order = $frozenOrder.find('.planning-freezeOrders-order');
      var index = ++this.nextOrderIndex;

      $frozenOrder
        .children()
        .first()
        .text(($frozenOrders.children().length + 1) + '.');

      $frozenOrder
        .find('.planning-freezeOrders-quantity')
        .attr('name', 'frozenOrders[' + index + '].quantity')
        .val(quantity || order.get('quantityTodo'));

      $order
        .find('input')
        .attr('name', 'frozenOrders[' + index + '].orderNo')
        .val(orderNo);

      $order
        .find('span')
        .html('<code>' + orderNo + '</code> <small>' + _.escape(order.get('name')) + '</small>');

      $frozenOrders.append($frozenOrder);
    },

    recountOrders: function()
    {
      this.$id('frozenOrders').children().each(function(i)
      {
        this.children[0].textContent = (i + 1) + '.';
      });
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      var req = view.ajax({
        method: 'PATCH',
        url: '/planning/plans/' + view.plan.id + '/lines/' + view.line.id,
        data: JSON.stringify({
          frozenOrders: _.map(form2js(this.el).frozenOrders, function(frozenOrder)
          {
            return {
              orderNo: frozenOrder.orderNo,
              quantity: parseInt(frozenOrder.quantity, 10)
            };
          }).filter(function(frozenOrder)
          {
            return frozenOrder.quantity > 0 && frozenOrder.quantity < 1000;
          })
        })
      });

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'lines:menu:freezeOrders:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('availableOrders').select2('focus');
    }

  });
});
