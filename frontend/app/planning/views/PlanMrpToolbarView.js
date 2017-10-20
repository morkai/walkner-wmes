// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  '../util/shift',
  'app/planning/templates/toolbar',
  'app/planning/templates/toolbarSetHourlyPlan',
  'app/planning/templates/toolbarPrintLineList',
  'app/planning/templates/printPage'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  clipboard,
  shiftUtil,
  toolbarTemplate,
  toolbarSetHourlyPlanTemplate,
  toolbarPrintLineListTemplate,
  printPageTemplate
) {
  'use strict';

  return View.extend({

    template: toolbarTemplate,

    events: {

      'click #-setHourlyPlan': function()
      {
        var $popover = this.$popover;
        var $btn = this.$id('setHourlyPlan');

        this.hidePopover();

        if ($popover && $popover[0] === $btn[0])
        {
          return;
        }

        this.$popover = this.$id('setHourlyPlan').popover({
          container: this.el,
          trigger: 'manual',
          placement: 'left',
          html: 1,
          hasContent: true,
          content: toolbarSetHourlyPlanTemplate({idPrefix: this.idPrefix}),
          template: '<div class="popover planning-mrp-toolbar-setHourlyPlans">'
            + '<div class="arrow"></div>'
            + '<div class="popover-content"></div>'
            + '</div>'
        });

        this.$popover.popover('show');
      },
      'click #-setHourlyPlan-yes': function()
      {
        this.hidePopover();
        this.setHourlyPlan();
      },
      'click #-setHourlyPlan-no': function()
      {
        this.hidePopover();
      },
      'click a[role="copyOrderList"]': function(e)
      {
        this.copyOrderList(+e.currentTarget.dataset.shift);
      },
      'click a[role="printLines"]': function(e)
      {
        this.printLines(e.currentTarget.dataset.line);
      },
      'click #-showTimes': function()
      {
        this.plan.displayOptions.togglePrintOrderTime();

        this.toggleShowTimes();

        return false;
      },
      'show.bs.dropdown #-printLines': 'toggleShowTimes'

    },

    localTopics: {

      'planning.escapePressed': 'hidePopover'

    },

    initialize: function()
    {
      this.listenTo(this.plan.lateOrders, 'reset', this.scheduleRender);
      this.listenTo(this.plan.sapOrders, 'reset', this.scheduleRender);
      this.listenTo(this.mrp.orders, 'added removed changed reset', this.scheduleRender);
      this.listenTo(this.mrp.lines, 'added removed changed reset', this.scheduleRender);
    },

    destroy: function()
    {
      this.hidePopover();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        lines: this.mrp.lines.map(function(line) { return line.id; }),
        stats: this.mrp.getStats()
      };
    },

    afterRender: function()
    {
      this.broker.publish('planning.mrpStatsRecounted', {mrp: this.mrp});
    },

    scheduleRender: function()
    {
      if (this.timers.render)
      {
        clearTimeout(this.timers.render);
      }

      if (this.plan.isAnythingLoading())
      {
        return;
      }

      this.timers.render = setTimeout(this.render.bind(this), 1);
    },

    hidePopover: function()
    {
      if (this.$popover)
      {
        this.$popover.popover('destroy');
        this.$popover = null;
      }
    },

    copyOrderList: function(shiftNo)
    {
      var view = this;
      var orderList = view.plan.getOrderList(
        function(planLine) { return !!view.mrp.lines.get(planLine.id); },
        shiftNo
      );

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        clipboardData.setData('text/plain', orderList.join('\r\n'));
        clipboardData.setData('text/html', '<ul><li>' + orderList.join('</li><li>') + '</li></ul>');

        var $btn = view.$id('copyOrderList').tooltip({
          container: view.el,
          trigger: 'manual',
          placement: 'left',
          title: t('planning', 'toolbar:copyOrderList:success')
        });

        $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success');

        if (view.timers.hideTooltip)
        {
          clearTimeout(view.timers.hideTooltip);
        }

        view.timers.hideTooltip = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
      });
    },

    printLines: function(what)
    {
      var mrp = this.mrp;
      var lines = [];

      if (_.isString(what))
      {
        if (what === '__ALL__')
        {
          lines = mrp.lines.models;
        }
        else
        {
          var line = mrp.lines.get(what);

          if (line)
          {
            lines.push(line);
          }
        }
      }
      else
      {
        _.forEach(what, function(lineId)
        {
          var line = mrp.lines.get(lineId);

          if (line)
          {
            lines.push(line);
          }
        });
      }

      if (!lines.length)
      {
        return;
      }

      var win = window.open(null, 'PLANNING:PLAN_PRINT');

      if (!win)
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('planning', 'toolbar:popups')
        });
      }

      win.document.body.innerHTML = printPageTemplate({
        date: this.plan.id,
        lines: _.pluck(lines, 'id').join(', '),
        showTimes: this.plan.displayOptions.isOrderTimePrinted(),
        pages: this.serializePrintPages(lines)
      });

      win.print();
    },

    serializePrintPages: function(lines)
    {
      var plan = this.plan;
      var prevShiftNo = -1;
      var pages = [];

      lines.forEach(function(line)
      {
        var bigPage = {
          pageNo: 1,
          pageCount: 1,
          mrp: line.settings.get('mrpPriority').join(' '),
          line: line.id,
          hourlyPlan: line.get('hourlyPlan'),
          workerCount: line.get('workerCount'),
          orders: line.orders.map(function(lineOrder, i)
          {
            var order = plan.orders.get(lineOrder.get('orderNo'));
            var shiftNo = shiftUtil.getShiftNo(lineOrder.get('startAt'));
            var nextShift = prevShiftNo !== -1 && shiftNo !== prevShiftNo;

            prevShiftNo = shiftNo;

            return {
              no: i + 1,
              orderNo: order.id,
              nc12: order.get('nc12'),
              name: order.get('name'),
              qtyTodo: order.get('quantityTodo'),
              qtyPlan: lineOrder.get('quantity'),
              startAt: lineOrder.get('startAt'),
              finishAt: lineOrder.get('finishAt'),
              nextShift: nextShift
            };
          })
        };

        var ordersPerPage = 42;
        var maxOrdersForHourlyPlan = 35;
        var orderCount = bigPage.orders.length;

        if (orderCount <= ordersPerPage)
        {
          if (orderCount > maxOrdersForHourlyPlan)
          {
            bigPage.hourlyPlan = null;
          }

          pages.push(bigPage);

          return;
        }

        var pageCount = Math.ceil(orderCount / ordersPerPage);

        for (var pageNo = 1; pageNo <= pageCount; ++pageNo)
        {
          var orders = bigPage.orders.slice((pageNo - 1) * ordersPerPage, pageNo * ordersPerPage);

          pages.push({
            pageNo: pageNo,
            pageCount: pageCount,
            line: bigPage.line,
            hourlyPlan: pageNo === pageCount && orders.length <= maxOrdersForHourlyPlan ? bigPage.hourlyPlan : null,
            orders: orders
          });
        }
      });

      return pages;
    },

    toggleShowTimes: function()
    {
      this.$id('showTimes')
        .blur()
        .find('.fa')
        .removeClass('fa-check fa-times')
        .addClass(this.plan.displayOptions.isOrderTimePrinted() ? 'fa-check' : 'fa-times');
    },

    setHourlyPlan: function()
    {
      var view = this;
      var $btn = view.$id('setHourlyPlan').prop('disabled', true);

      viewport.msg.saving();

      var req = view.plan.setHourlyPlans(function(planLine)
      {
        return !!view.mrp.lines.get(planLine.id);
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
      });

      req.always(function()
      {
        $btn.prop('disabled', false);
      });
    }

  });
});
