// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  '../util/shift',
  'app/planning/templates/toolbar',
  'app/planning/templates/toolbarPrintLineList',
  'app/planning/templates/printPage'
], function(
  _,
  t,
  time,
  viewport,
  View,
  shiftUtil,
  toolbarTemplate,
  toolbarPrintLineListTemplate,
  printPageTemplate
) {
  'use strict';

  return View.extend({

    template: toolbarTemplate,

    events: {

      'click a[data-print-line]': function(e)
      {
        this.printLines(e.currentTarget.dataset.printLine);
      },
      'click #-showTimes': function()
      {
        this.plan.displayOptions.togglePrintOrderTime();

        this.toggleShowTimes();

        return false;
      },
      'show.bs.dropdown #-printDropdown': 'toggleShowTimes'

    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        lines: this.mrp.lines.map(function(line) { return line.id; })
      };
    },

    updatePrintAction: function()
    {
      this.$id('printPlan').prop('disabled', !this.mrp.lines.length);
      this.$id('printList').html(toolbarPrintLineListTemplate(this.serialize()));
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
    }

  });
});
