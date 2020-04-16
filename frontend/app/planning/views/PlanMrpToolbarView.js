// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/util/html2pdf',
  'app/data/clipboard',
  'app/printers/views/PrinterPickerView',
  'app/prodShifts/ProdShiftCollection',
  '../util/shift',
  '../PlanSapOrderCollection',
  './ToggleMrpLockDialogView',
  'app/planning/templates/toolbar',
  'app/planning/templates/toolbarPrintLineList',
  'app/planning/templates/printPage',
  'app/planning/templates/orderStatusIcons'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  DialogView,
  html2pdf,
  clipboard,
  PrinterPickerView,
  ProdShiftCollection,
  shiftUtil,
  PlanSapOrderCollection,
  ToggleMrpLockDialogView,
  toolbarTemplate,
  toolbarPrintLineListTemplate,
  printPageTemplate,
  orderStatusIconsTemplate
) {
  'use strict';

  return View.extend({

    template: toolbarTemplate,

    modelProperty: 'plan',

    events: {

      'click a[role="copyOrderList"]': function(e)
      {
        this.copyOrderList(+e.currentTarget.dataset.shift);
      },
      'click a[role="printLines"]': function(e)
      {
        var view = this;
        var what = e.currentTarget.dataset.line;
        var lines = [];

        if (_.isString(what))
        {
          if (what === '__ALL__')
          {
            lines = view.mrp.lines.models;
          }
          else
          {
            var line = view.mrp.lines.get(what);

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
            var line = view.mrp.lines.get(lineId);

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

        var timeDiff = time.getMoment(this.plan.id + ' 06:00:00', 'YYYY-MM-DD HH:mm:ss').diff(Date.now(), 'minutes');

        if (timeDiff > -23 * 60 || e.altKey)
        {
          this.printLines(e, lines);
        }
        else
        {
          this.loadAndPrintLines(e, lines);
        }
      },
      'click #-showTimes': function()
      {
        this.plan.displayOptions.togglePrintOrderTime();

        this.toggleShowTimes();

        return false;
      },
      'show.bs.dropdown #-printLines': 'toggleShowTimes',
      'click #-toggleLock': function()
      {
        var view = this;
        var locked = view.plan.settings.isMrpLockedDirectly(view.mrp.id);
        var dialogView = new ToggleMrpLockDialogView({
          model: {
            locked: locked,
            mrp: view.mrp.id,
            date: view.plan.id
          }
        });

        view.listenTo(dialogView, 'answered', function(answer)
        {
          if (answer !== 'yes')
          {
            return;
          }

          viewport.msg.saving();

          view.mrp.settings.set('locked', !locked);

          var req = view.plan.settings.save();

          req.done(function()
          {
            viewport.msg.saved();
          });

          req.fail(function()
          {
            viewport.msg.savingFailed();

            view.plan.settings.trigger('errored');
          });
        });

        viewport.showDialog(dialogView, view.t('toggleLock:title:' + locked));
      }

    },

    initialize: function()
    {
      this.listenTo(this.plan.lateOrders, 'reset', this.scheduleRender);
      this.listenTo(this.plan.sapOrders, 'reset', this.scheduleRender);
      this.listenTo(this.mrp.orders, 'added removed changed reset', this.scheduleRender);
      this.listenTo(this.mrp.lines, 'added removed changed reset', this.scheduleRender);
      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        lines: this.mrp.lines.map(function(line) { return line.id; }),
        stats: this.options.stats === false ? null : this.mrp.getStats(),
        canLock: this.plan.canLockMrps(),
        locked: this.plan.settings.isMrpLockedDirectly(this.mrp.id)
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

    copyOrderList: function(shiftNo)
    {
      var view = this;
      var mrps = {};

      mrps[this.mrp.id] = true;

      var orderList = view.plan.getOrderList(mrps, shiftNo);

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
          title: view.t('toolbar:copyOrderList:success')
        });

        $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success');

        if (view.timers.hideTooltip)
        {
          clearTimeout(view.timers.hideTooltip);
        }

        view.timers.hideTooltip = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
      });
    },

    loadAndPrintLines: function(e, lines)
    {
      var view = this;
      var $btn = view.$id('printLines').find('.btn').prop('disabled', true);
      var $icon = $btn.find('.fa').removeClass('fa-print').addClass('fa-spinner fa-spin');
      var shiftMoment = time.getMoment(view.plan.id + ' 06:00:00', 'YYYY-MM-DD HH:mm:ss');
      var prodShifts = new ProdShiftCollection(null, {
        url: '/prodShifts?select(prodLine,shift,quantitiesDone)&limit(0)'
          + '&date=in=('
          + [shiftMoment.valueOf(), shiftMoment.add(8, 'hours').valueOf(), shiftMoment.add(8, 'hours').valueOf()]
          + ')'
          + '&prodLine=in=(' + _.pluck(lines, 'id') + ')'
      });
      var sapOrders = new PlanSapOrderCollection(null, {
        paginate: false,
        plan: view.plan,
        mrp: view.mrp.id
      });
      var shiftsReq = view.promised(prodShifts.fetch());
      var ordersReq = view.promised(sapOrders.fetch());
      var req = $.when(shiftsReq, ordersReq);

      shiftsReq.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('MSG:LOADING_FAILURE:shifts')
        });
      });

      ordersReq.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('MSG:LOADING_FAILURE:sapOrders')
        });
      });

      req.done(function()
      {
        var quantitiesDone = {};

        prodShifts.forEach(function(prodShift)
        {
          var prodLine = prodShift.get('prodLine');

          if (!quantitiesDone[prodLine])
          {
            quantitiesDone[prodLine] = shiftUtil.EMPTY_HOURLY_PLAN.slice();
          }

          var startIndex = (prodShift.get('shift') - 1) * 8;

          prodShift.get('quantitiesDone').forEach(function(quantityDone, i)
          {
            quantitiesDone[prodLine][startIndex + i] += quantityDone.actual;
          });
        });

        view.printLines(e, lines, sapOrders, quantitiesDone);
      });

      req.always(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass('fa-print');
        $btn.prop('disabled', false);
      });
    },

    printLines: function(e, lines, sapOrders, quantitiesDone)
    {
      var view = this;

      e.contextMenu = {
        view: view,
        tag: 'planning'
      };

      PrinterPickerView.contextMenu(e, function(printer)
      {
        var html = printPageTemplate({
          date: view.plan.id,
          lines: _.pluck(lines, 'id').join(', '),
          showTimes: !!sapOrders || view.plan.displayOptions.isOrderTimePrinted(),
          done: !!sapOrders,
          pages: view.serializePrintPages(lines, sapOrders, quantitiesDone),
          pad: function(v)
          {
            if (v < 10)
            {
              return '&nbsp;' + v;
            }

            return v;
          }
        });

        html2pdf(html, printer);
      });
    },

    serializePrintPages: function(lines, sapOrders, quantitiesDone)
    {
      var view = this;
      var done = !!sapOrders;
      var plan = view.plan;
      var prevShiftNo = -1;
      var pages = [];
      var doneOrders = {};

      lines.forEach(function(line)
      {
        var workerCounts = [];
        var bigPage = {
          pageNo: 1,
          pageCount: 1,
          mrp: line.settings.get('mrpPriority').join(' '),
          line: line.id,
          hourlyPlan: line.get('hourlyPlan'),
          quantityDone: done ? (quantitiesDone[line.id] || shiftUtil.EMPTY_HOURLY_PLAN.slice()) : null,
          workerCount: '?',
          orders: []
        };

        line.orders.forEach(function(lineOrder, i)
        {
          var orderNo = lineOrder.get('orderNo');
          var order = plan.orders.get(orderNo);
          var shiftNo = shiftUtil.getShiftNo(lineOrder.get('startAt'));
          var nextShift = prevShiftNo !== -1 && shiftNo !== prevShiftNo;

          prevShiftNo = shiftNo;

          var lineMrpSettings = order ? line.mrpSettings(order.get('mrp')) : null;

          if (lineMrpSettings && !_.includes(workerCounts, lineMrpSettings.get('workerCount')))
          {
            workerCounts.push(lineMrpSettings.get('workerCount'));
          }

          var qtyPlan = lineOrder.get('quantity');
          var qtyDone = done ? plan.shiftOrders.getTotalQuantityDone(line.id, shiftNo, orderNo) : -1;

          var printOrder = {
            no: i + 1,
            missing: !order,
            orderNo: orderNo,
            nc12: order ? order.get('nc12') : '?',
            name: order ? order.get('name') : '?',
            kind: order ? order.get('kind') : '?',
            qtyTodo: order ? order.get('quantityTodo') : '?',
            qtyPlan: qtyPlan,
            qtyClass: qtyDone === -1
              ? ''
              : qtyDone === qtyPlan
                ? 'is-completed'
                : qtyDone > qtyPlan ? 'is-surplus' : qtyDone > 0 ? 'is-incomplete' : '',
            startAt: lineOrder.get('startAt'),
            finishAt: lineOrder.get('finishAt'),
            nextShift: nextShift,
            icons: orderStatusIconsTemplate(plan, orderNo)
          };

          bigPage.orders.push(printOrder);

          if (done && !doneOrders[orderNo])
          {
            var sapOrder = sapOrders.get(orderNo);
            var shiftOrders = plan.shiftOrders.findOrders(orderNo, line.id).sort(function(a, b)
            {
              return Date.parse(a.get('startedAt')) - Date.parse(b.get('startedAt'));
            });
            var delayReason = sapOrder ? view.delayReasons.get(sapOrder.get('delayReason')) : '';
            var comment = sapOrder ? sapOrder.get('comment') : '';

            if (delayReason)
            {
              delayReason = delayReason.getLabel();

              if (comment)
              {
                delayReason += ':';
              }
            }

            shiftOrders.forEach(function(shiftOrder, i)
            {
              bigPage.orders.push({
                no: null,
                delayReason: i === 0 && delayReason ? delayReason : '',
                comment: i === 0 ? comment : '',
                qtyTodo: lineOrder.get('quantity'),
                qtyPlan: shiftOrder.get('quantityDone'),
                startAt: time.utc.getMoment(
                  time.getMoment(shiftOrder.get('startedAt')).format('YYYY-MM-DD HH:mm:ss'),
                  'YYYY-MM-DD HH:mm:ss'
                ).valueOf(),
                finishAt: time.utc.getMoment(
                  time.getMoment(shiftOrder.get('finishedAt')).format('YYYY-MM-DD HH:mm:ss'),
                  'YYYY-MM-DD HH:mm:ss'
                ).valueOf(),
                nextShift: false,
                psStatus: 'unknown'
              });
            });

            if (!shiftOrders.length && (comment || delayReason))
            {
              bigPage.orders.push({
                no: null,
                delayReason: delayReason,
                comment: comment,
                qtyTodo: lineOrder.get('quantity'),
                qtyDone: 0,
                startAt: null,
                finishAt: null,
                nextShift: false,
                psStatus: 'unknown'
              });
            }

            doneOrders[orderNo] = true;
          }
        });

        if (workerCounts.length === 0)
        {
          workerCounts.push(1);
        }

        if (workerCounts.length === 1)
        {
          bigPage.workerCount = view.t('print:workerCount', {count: workerCounts[0]});
        }
        else
        {
          workerCounts.sort();

          bigPage.workerCount = view.t('print:workerCounts', {
            to: workerCounts.pop(),
            from: workerCounts.join('-')
          });
        }

        var ordersPerPage = 42;
        var maxOrdersForHourlyPlan = 35;
        var orderCount = bigPage.orders.length;

        if (orderCount <= maxOrdersForHourlyPlan)
        {
          pages.push(bigPage);

          return;
        }

        var pageCount = Math.ceil(orderCount / ordersPerPage);
        var pageNo;

        for (pageNo = 1; pageNo <= pageCount; ++pageNo)
        {
          pages.push({
            pageNo: pageNo,
            pageCount: pageCount,
            mrp: bigPage.mrp,
            line: bigPage.line,
            hourlyPlan: null,
            quantityDone: null,
            workerCount: bigPage.workerCount,
            orders: bigPage.orders.slice((pageNo - 1) * ordersPerPage, pageNo * ordersPerPage)
          });
        }

        var lastPage = _.last(pages);

        if (lastPage.orders.length <= maxOrdersForHourlyPlan)
        {
          lastPage.hourlyPlan = bigPage.hourlyPlan;
          lastPage.quantityDone = bigPage.quantityDone;

          return;
        }

        pageCount += 1;

        pages.forEach(function(page)
        {
          page.pageCount = pageCount;
        });

        pages.push({
          pageNo: lastPage.pageNo + 1,
          pageCount: pageCount,
          mrp: bigPage.mrp,
          line: bigPage.line,
          hourlyPlan: bigPage.hourlyPlan,
          quantityDone: bigPage.quantityDone,
          workerCount: bigPage.workerCount,
          orders: []
        });
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

    onSettingsChanged: function(changes)
    {
      if (changes.locked)
      {
        var locked = this.plan.settings.isMrpLockedDirectly(this.mrp.id);

        this.$id('toggleLock')
          .toggleClass('active', locked)
          .attr('title', this.t('toolbar:toggleLock:' + locked));
      }
    }

  });
});
