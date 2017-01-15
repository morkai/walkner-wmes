// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  '../util/shift',
  'app/hourlyPlans/templates/dailyMrpPlans/toolbar',
  'app/hourlyPlans/templates/dailyMrpPlans/printPage',
  'app/hourlyPlans/templates/dailyMrpPlans/_printLineList'
], function(
  _,
  t,
  time,
  viewport,
  View,
  shiftUtil,
  template,
  renderPrintPage,
  renderPrintLineList
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-generatePlan': function()
      {
        this.model.generate();
      },
      'click #-savePlan': function()
      {
        var $btn = this.$id('savePlan').prop('disabled', true);
        var $icon = $btn.find('.fa').removeClass('fa-save').addClass('fa-spinner fa-spin');

        this.model.saveLines().always(function()
        {
          $icon.removeClass('fa-spinner fa-spin').addClass('fa-save');
          $btn.prop('disabled', false);
        });
      },
      'click #-setHourlyPlan': function()
      {
        var view = this;
        var $btn = view.$id('setHourlyPlan').prop('disabled', true);
        var $icon = $btn.find('.fa').removeClass('fa-calendar').addClass('fa-spinner fa-spin');

        this.model.collection.setHourlyPlans(function(plan) { return plan === view.model; }).always(function()
        {
          $icon.removeClass('fa-spinner fa-spin').addClass('fa-calendar');
          $btn.prop('disabled', false);
        });
      },
      'click a[data-print-line]': function(e)
      {
        this.printLine(e.currentTarget.dataset.printLine);
      },
      'click #-showTimes': function()
      {
        this.model.collection.options.set('printOrderTimes', !this.model.collection.options.get('printOrderTimes'));

        this.toggleShowTimes();

        return false;
      },
      'show.bs.dropdown #-printDropdown': 'toggleShowTimes'

    },

    initialize: function()
    {
      this.listenTo(this.model.lines, 'reset', this.onLinesReset);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        lines: this.model.lines.pluck('_id')
      };
    },

    onLinesReset: function()
    {
      this.$id('printPlan').prop('disabled', !this.model.lines.length);
      this.$id('printList').html(renderPrintLineList({lines: this.model.lines.pluck('_id')}));
    },

    printLine: function(lineId)
    {
      var plan = this.model;
      var line = plan.lines.get(lineId);

      if (!line)
      {
        return;
      }

      var win = window.open(null, 'PLANNING:PLAN_PRINT');

      if (!win)
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('hourlyPlans', 'planning:toolbar:popups')
        });
      }

      var prevShiftNo = -1;

      win.document.body.innerHTML = renderPrintPage({
        mrp: plan.mrp.id,
        line: line.id,
        date: plan.date,
        hourlyPlan: line.get('hourlyPlan'),
        showTimes: plan.collection.options.get('printOrderTimes'),
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
            qtyTodo: order.get('qtyTodo'),
            qtyPlan: lineOrder.get('qty'),
            startAt: lineOrder.get('startAt'),
            finishAt: lineOrder.get('finishAt'),
            nextShift: nextShift
          };
        })
      });

      win.print();
    },

    toggleShowTimes: function()
    {
      this.$id('showTimes')
        .blur()
        .find('.fa')
        .removeClass('fa-check fa-times')
        .addClass(this.model.collection.options.get('printOrderTimes') ? 'fa-check' : 'fa-times');
    }

  });
});
