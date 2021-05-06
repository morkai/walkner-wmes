// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/data/downtimeReasons',
  '../util/shift',
  '../util/contextMenu',
  'app/planning/templates/lineOrders',
  'app/planning/templates/lineOrderPopover',
  'app/planning/templates/lineOrderDowntimePopover',
  'app/planning/templates/lineOrderShiftPopover',
  'app/planning/templates/lineOrderLinePopover',
  'app/planning/templates/orderStatusIcons'
], function(
  _,
  $,
  t,
  user,
  View,
  downtimeReasons,
  shiftUtil,
  contextMenu,
  lineOrdersTemplate,
  lineOrderPopoverTemplate,
  lineOrderDowntimePopoverTemplate,
  lineOrderShiftPopoverTemplate,
  lineOrderLinePopoverTemplate,
  orderStatusIconsTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersTemplate,

    modelProperty: 'plan',

    events: {
      'mouseenter .is-lineOrder': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: true,
          orderNo: this.line.orders.get(e.currentTarget.dataset.id).get('orderNo')
        });
      },
      'mouseleave .is-lineOrder': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: false,
          orderNo: this.line.orders.get(e.currentTarget.dataset.id).get('orderNo')
        });
      },
      'click .is-lineOrder': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        const orderNo = this.line.orders.get(e.currentTarget.dataset.id).get('orderNo');

        if (e.ctrlKey)
        {
          window.open(`/#orders/${orderNo}`);

          return;
        }

        if (this.mrp.orders.get(orderNo))
        {
          this.mrp.orders.trigger('preview', {
            orderNo,
            source: 'lineOrders'
          });

          return;
        }

        const planOrder = this.plan.orders.get(orderNo);

        if (!planOrder)
        {
          return;
        }

        const externalMrp = this.plan.mrps.get(planOrder.get('mrp'));

        if (!externalMrp)
        {
          return;
        }

        externalMrp.orders.trigger('preview', {
          orderNo,
          scrollIntoView: true,
          source: 'lineOrders'
        });
      },
      'contextmenu .is-lineOrder': function(e)
      {
        this.showLineOrderMenu(e);

        return false;
      },
      'contextmenu .is-downtime': function(e)
      {
        e.preventDefault();
      }
    },

    initialize: function()
    {
      const view = this;

      view.listenTo(view.plan, 'change:active', this.renderIfNotLoading);

      view.listenTo(view.plan.displayOptions, 'change:useLatestOrderData', view.render);

      view.listenTo(view.plan.shiftOrders, 'add', view.updateShiftOrder);
      view.listenTo(view.plan.shiftOrders, 'change:quantityDone', view.updateShiftOrder);

      view.listenTo(view.plan.sapOrders, 'reset', view.onSapOrdersReset);

      view.listenTo(view.plan.whProblems, 'reset', view.onWhProblemReset);
      view.listenTo(view.plan.whProblems, 'add', view.onWhProblemAdd);
      view.listenTo(view.plan.whProblems, 'remove', view.onWhProblemRemove);

      view.listenTo(view.line.orders, 'reset', view.renderIfNotLoading);
      view.listenTo(view.line.orders, 'change:executed', view.onLineOrderExecuted);

      view.listenTo(view.mrp.orders, 'highlight', view.onOrderHighlight);
      view.listenTo(view.mrp.orders, 'change:incomplete', view.onIncompleteChange);

      if (view.prodLineState)
      {
        view.listenTo(view.prodLineState, 'change:online', view.onOnlineChange);
        view.listenTo(view.prodLineState, 'change:state', view.updateShiftState);
        view.listenTo(view.prodLineState, 'change:prodShift', view.updateShiftState);
        view.listenTo(view.prodLineState, 'change:prodShiftOrders', view.updateShiftState);
      }
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    getTemplateData: function()
    {
      const prodState = this.serializeProdState();

      return {
        prodState,
        line: this.line.id,
        shifts: this.serializeShifts(prodState)
      };
    },

    afterRender: function()
    {
      const view = this;

      view.$el.popover({
        container: view.el,
        selector: 'div[data-popover-content]',
        trigger: 'hover',
        html: true,
        placement: function()
        {
          return this.$element[0].dataset.popoverPlacement || 'top';
        },
        hasContent: true,
        className: 'planning-mrp-popover',
        content: function()
        {
          switch (this.dataset.popoverContent)
          {
            case 'lineOrder':
              return view.serializeOrderPopover(this.dataset.id);

            case 'downtime':
              return view.serializeDowntimePopover(this.dataset.id);

            case 'shift':
              return view.serializeShiftPopover(this.dataset.shift - 1);

            case 'line':
              return view.serializeLinePopover();
          }
        }
      });
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    $item: function(id)
    {
      return id ? this.$(`.planning-mrp-list-item[data-id="${id}"]`) : this.$('.planning-mrp-list-item');
    },

    serializeProdState: function()
    {
      const prodLineState = this.prodLineState;

      if (!prodLineState || !this.plan.isProdStateUsed())
      {
        return {
          online: '',
          shift: 0,
          state: '',
          orderNo: ''
        };
      }

      const prodShift = prodLineState.get('prodShift');
      const prodShiftOrder = prodLineState.getCurrentOrder();

      return {
        online: prodLineState.get('online') ? 'is-online' : 'is-offline',
        state: prodLineState.get('state') || '',
        shift: prodShift ? prodShift.get('shift') : 0,
        orderNo: prodShiftOrder ? prodShiftOrder.get('orderId') : ''
      };
    },

    serializeShifts: function(prodState)
    {
      const plan = this.plan;
      const planMrp = this.mrp;
      const planLine = this.line;
      const shifts = [];

      if (planLine.orders.length === 0)
      {
        return shifts;
      }

      [0, 1, 2, 3].forEach(no =>
      {
        shifts.push({
          no,
          state: prodState.shift === no ? prodState.state : '',
          startTime: 0,
          orders: [],
          downtimes: []
        });
      });

      planLine.orders.forEach(lineOrder =>
      {
        const orderNo = lineOrder.get('orderNo');
        const planOrder = plan.orders.get(orderNo);
        const orderData = plan.getActualOrderData(orderNo);
        const mrp = planOrder ? planOrder.get('mrp') : planOrder;
        const startAt = Date.parse(lineOrder.get('startAt'));
        const finishAt = Date.parse(lineOrder.get('finishAt'));
        const duration = finishAt - startAt;
        const shift = shifts[shiftUtil.getShiftNo(startAt)];

        if (shift.startTime === 0)
        {
          shift.startTime = shiftUtil.getShiftStartTime(startAt);
        }

        const prevShiftOrder = shift.orders[shift.orders.length - 1];
        const prevFinishedAt = prevShiftOrder ? prevShiftOrder.finishAt : shift.startTime;
        const quantityTodo = lineOrder.get('quantity');
        const quantityDone = plan.shiftOrders.getTotalQuantityDone(planLine.id, lineOrder);
        const shiftOrderCompleted = quantityDone >= quantityTodo;
        const sapOrderCompleted = orderData.quantityDone >= orderData.quantityTodo;
        const confirmed = orderData.statuses.includes('CNF');
        const delivered = orderData.statuses.includes('DLV');

        shift.orders.push({
          _id: lineOrder.id,
          orderNo,
          quantity: lineOrder.get('quantity'),
          missing: planOrder ? '' : 'is-missing',
          incomplete: planOrder && planOrder.get('incomplete') > 0 ? 'is-incomplete' : '',
          completed: shiftOrderCompleted || sapOrderCompleted || confirmed || delivered ? 'is-completed' : '',
          started: quantityDone > 0 && quantityDone < quantityTodo ? 'is-started' : '',
          confirmed: confirmed ? 'is-cnf' : '',
          delivered: delivered ? 'is-dlv' : '',
          selected: orderNo === prodState.orderNo ? 'is-selected' : '',
          executed: this.resolveExecutedClassName(lineOrder),
          problem: plan.whProblems.isProblem(planLine.id, orderNo) ? 'is-problem' : '',
          external: mrp !== planMrp.id ? 'is-external' : '',
          finishAt,
          margin: (startAt - prevFinishedAt) * 100 / shiftUtil.SHIFT_DURATION,
          width: duration * 100 / shiftUtil.SHIFT_DURATION,
          mrp
        });
      });

      planLine.get('downtimes').forEach((downtime, i) =>
      {
        const startAt = Date.parse(downtime.startAt);
        const shift = shifts[shiftUtil.getShiftNo(startAt)];

        shift.downtimes.push({
          _id: i,
          reason: downtime.reason,
          left: (startAt - shift.startTime) * 100 / shiftUtil.SHIFT_DURATION,
          width: downtime.duration * 100 / shiftUtil.SHIFT_DURATION
        });
      });

      return shifts.filter(shift =>
      {
        if (shift.no === 0)
        {
          return false;
        }

        if (shift.orders.length > 0)
        {
          return true;
        }

        return !!shifts[shift.no + 1] && shifts[shift.no + 1].orders.length > 0;
      });
    },

    serializeLinePopover: function()
    {
      const hourlyPlan = this.line.get('hourlyPlan');
      let orderCount = 0;
      let quantity = 0;
      let manHours = 0;

      (this.line.get('shiftData') || []).forEach(function(shift, shiftNo)
      {
        if (shiftNo === 0)
        {
          return;
        }

        orderCount += shift.orderCount;
        quantity += shift.quantity;
        manHours += shift.manHours;
      });

      return this.renderPartialHtml(lineOrderLinePopoverTemplate, {
        stats: {
          orderCount,
          quantity,
          manHours,
          hourlyPlan
        }
      });
    },

    serializeShiftPopover: function(shiftI)
    {
      const hourlyPlan = this.line.get('hourlyPlan').slice(shiftI * 8, shiftI * 8 + 8);
      const shiftData = (this.line.get('shiftData') || [])[shiftI + 1] || {};

      return this.renderPartialHtml(lineOrderShiftPopoverTemplate, {
        stats: {
          orderCount: shiftData.orderCount || 0,
          quantity: shiftData.quantity || 0,
          manHours: shiftData.manHours || 0,
          hourlyPlan: hourlyPlan
        }
      });
    },

    serializeOrderPopover: function(id)
    {
      const lineOrder = this.line.orders.get(id);
      const orderNo = lineOrder.get('orderNo');
      const sapOrder = this.plan.sapOrders.get(orderNo);
      const orderData = this.plan.getActualOrderData(orderNo);
      const startAt = Date.parse(lineOrder.get('startAt'));
      const finishAt = Date.parse(lineOrder.get('finishAt'));
      const quantityDone = this.plan.isProdStateUsed()
        ? this.plan.shiftOrders.getTotalQuantityDone(this.line.id, lineOrder)
        : -1;
      const orderGroup = this.orderGroups.get(lineOrder.get('group'));

      return this.renderPartialHtml(lineOrderPopoverTemplate, {
        lineOrder: {
          _id: lineOrder.id,
          orderNo: orderNo,
          quantityPlanned: lineOrder.get('quantity'),
          quantityRemaining: orderData.quantityTodo - orderData.quantityDone,
          quantityTotal: orderData.quantityTodo,
          quantityDone: quantityDone,
          pceTime: lineOrder.get('pceTime') / 1000,
          manHours: lineOrder.get('manHours') || 0,
          startAt: startAt,
          finishAt: finishAt,
          duration: (finishAt - startAt) / 1000,
          comment: sapOrder ? sapOrder.getCommentWithIcon() : '',
          statusIcons: orderStatusIconsTemplate(this.plan, orderNo, {sapStatuses: false}),
          group: orderGroup ? orderGroup.getLabel() : ''
        }
      });
    },

    serializeDowntimePopover: function(id)
    {
      const downtime = this.line.get('downtimes')[id];
      const startAt = Date.parse(downtime.startAt);
      const finishAt = startAt + downtime.duration;
      const downtimeReason = downtimeReasons.get(downtime.reason);

      return lineOrderDowntimePopoverTemplate({
        lineDowntime: {
          reason: downtimeReason ? downtimeReason.getLabel() : downtime.reason,
          startAt,
          finishAt,
          duration: downtime.duration / 1000
        }
      });
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showLineOrderMenu: function(e)
    {
      const lineOrder = this.line.orders.get(this.$(e.currentTarget).attr('data-id'));
      const orderNo = lineOrder.get('orderNo');
      const menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW')
        && (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone))
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: this.t('orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, lineOrder)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.commentPopover(orderNo));
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleShiftOrderAction: function(lineOrder)
    {
      const orderNo = lineOrder.get('orderNo');
      const line = this.line.id;
      const shift = shiftUtil.getShiftNo(lineOrder.get('startAt'));
      let shiftOrders = this.plan.shiftOrders.findOrders(orderNo, line, shift);

      if (shiftOrders.length === 1)
      {
        return window.open(`/#prodShiftOrders/${shiftOrders[0].id}`);
      }

      if (shiftOrders.length)
      {
        return window.open(
          '/#prodShiftOrders?sort(startedAt)&limit(-1337)'
            + '&orderId=string:' + orderNo
            + '&prodLine=' + encodeURIComponent(line)
            + '&shift=' + shift
        );
      }

      shiftOrders = this.plan.shiftOrders.findOrders(orderNo, line);

      if (shiftOrders.length === 1)
      {
        return window.open(`/#prodShiftOrders/${shiftOrders[0].id}`);
      }

      if (shiftOrders.length)
      {
        return window.open(
          '/#prodShiftOrders?sort(startedAt)&limit(-1337)'
            + '&orderId=string:' + orderNo
            + '&prodLine=' + encodeURIComponent(line)
        );
      }

      shiftOrders = this.plan.shiftOrders.findOrders(orderNo);

      if (shiftOrders.length === 1)
      {
        return window.open(`/#prodShiftOrders/${shiftOrders[0].id}`);
      }

      window.open(`/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=string:${orderNo}`);
    },

    updateShiftState: function()
    {
      const prodState = this.serializeProdState();
      const $shifts = this.$('.planning-mrp-lineOrders-shift').attr('data-state', '');
      const $shift = $shifts.filter(`[data-shift="${prodState.shift}"]`);

      if ($shift.length && prodState.state)
      {
        $shift.attr('data-state', prodState.state);
      }

      this.$('.is-selected').removeClass('is-selected');

      if (prodState.shift && prodState.orderNo)
      {
        this.$(`.is-lineOrder[data-order-no="${prodState.orderNo}"]`).addClass('is-selected');
      }
    },

    onOrderHighlight: function(message)
    {
      this.$(`.is-lineOrder[data-order-no="${message.orderNo}"]`)
        .toggleClass('is-highlighted', message.state);
    },

    onIncompleteChange: function(model)
    {
      this.$(`.is-lineOrder[data-order-no="${model.id}"]`)
        .toggleClass('is-incomplete', model.get('incomplete') > 0);
    },

    onSapOrdersReset: function(sapOrders, options)
    {
      if (!options.reload && this.plan.displayOptions.isLatestOrderDataUsed())
      {
        this.render();
      }
    },

    onOnlineChange: function()
    {
      const $hd = this.$('.planning-mrp-list-hd').removeClass('is-online is-offline');

      if (this.prodLineState && this.plan.isProdStateUsed())
      {
        $hd.addClass(this.prodLineState.get('online') ? 'is-online' : 'is-offline');
      }
    },

    updateShiftOrder: function(planShiftOrder)
    {
      if (!this.prodLineState || !this.plan.isProdStateUsed() || planShiftOrder.get('prodLine') !== this.line.id)
      {
        return;
      }

      const prodShift = this.prodLineState.get('prodShift');

      if (!prodShift)
      {
        return;
      }

      const shift = prodShift.get('shift');
      const orderNo = planShiftOrder.get('orderId');
      const $lineOrder = this.$id('list-' + shift).find('.is-lineOrder[data-order-no="' + orderNo + '"]');

      if (!$lineOrder.length)
      {
        return;
      }

      const lineOrder = this.line.orders.get($lineOrder.attr('data-id'));

      if (!lineOrder)
      {
        return;
      }

      this.onLineOrderExecuted(lineOrder);
    },

    onLineOrderExecuted: function(lineOrder)
    {
      this.$(`.is-lineOrder[data-id="${lineOrder.id}"]`)
        .removeClass('is-sequence-ok is-sequence-nok is-sequence-unknown')
        .addClass(this.resolveExecutedClassName(lineOrder));
    },

    resolveExecutedClassName: function(lineOrder)
    {
      const executed = lineOrder.get('executed');

      if (executed)
      {
        return 'is-sequence-ok';
      }

      if (executed == null)
      {
        return 'is-sequence-unknown';
      }

      if (this.plan.shiftOrders.findOrders(lineOrder.get('orderNo')).length)
      {
        return 'is-sequence-nok';
      }

      return 'is-sequence-unknown';
    },

    onWhProblemReset: function()
    {
      this.$('.is-problem').removeClass('is-problem');

      this.plan.whProblems.forEach(this.onWhProblemAdd, this);
    },

    onWhProblemAdd: function(whProblem)
    {
      if (whProblem.get('line') !== this.line.id)
      {
        return;
      }

      this.$(`.is-lineOrder[data-order-no="${whProblem.get('order')}"]`).addClass('is-problem');
    },

    onWhProblemRemove: function(whProblem)
    {
      if (whProblem.get('line') !== this.line.id)
      {
        return;
      }

      this.$(`.is-problem[data-order-no="${whProblem.get('order')}"]`).removeClass('is-problem');
    }

  });
});
