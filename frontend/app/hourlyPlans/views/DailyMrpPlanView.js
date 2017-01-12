// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  '../util/scrollIntoView',
  './DailyMrpPlanLinesView',
  './DailyMrpPlanOrdersView',
  './DailyMrpPlanLineOrdersView',
  'app/hourlyPlans/templates/dailyMrpPlans/plan'
], function(
  _,
  View,
  scrollIntoView,
  DailyMrpPlanLinesView,
  DailyMrpPlanOrdersView,
  DailyMrpPlanLineOrdersView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'mouseleave #-lineOrders': function()
      {
        this.$crosshair.addClass('hidden');
      },

      'mouseenter #-lineOrders': function()
      {
        this.$crosshair.removeClass('hidden');
      },

      'mousemove .dailyMrpPlan-lineOrders-list': function(e)
      {
        this.$crosshair[0].style.height = (this.$lineOrders.outerHeight() + 6) + 'px';
        this.$crosshair[0].style.top = this.$lineOrders.position().top + 'px';
        this.$crosshair[0].style.left = e.pageX + 'px';
      }

    },

    initialize: function()
    {
      this.debounceGeneratePlan = _.debounce(this.model.generate.bind(this.model), 1, false);
      this.onLineOrdersReset = _.debounce(this.toggleTimeline.bind(this), 1, false);

      var plan = this.model;
      var lines = plan.lines;
      var orders = plan.orders;

      this.listenTo(plan, 'reset', this.render);
      this.listenTo(plan, 'itemEntered', this.onItemEntered);
      this.listenTo(plan, 'itemLeft', this.onItemLeft);

      this.listenTo(orders, 'reset', this.generatePlan);
      this.listenTo(orders, 'change:operation', this.generatePlan);

      this.listenTo(lines, 'reset', this.renderLineOrders);
      this.listenTo(lines, 'reset', this.generatePlan);
      this.listenTo(lines, 'change:activeFrom change:activeTo change:workerCount', this.generatePlan);
      this.listenTo(lines, 'lineOrderClicked', this.onLineOrderClicked);

      this.linesView = new DailyMrpPlanLinesView({model: this.model.lines}, {plan: this});
      this.ordersView = new DailyMrpPlanOrdersView({model: this.model.orders}, {plan: this});

      this.setView('#' + this.idPrefix + '-lines', this.linesView);
      this.setView('#' + this.idPrefix + '-orders', this.ordersView);
    },

    generatePlan: function(model, options)
    {
      if (options && options.skipGenerate)
      {
        return;
      }

      this.model.generate();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        mrp: {
          _id: this.model.mrp.id,
          name: this.model.mrp.get('description')
        }
      };
    },

    afterRender: function()
    {
      this.renderLineOrders();

      this.$lineOrders = this.$id('lineOrders');
      this.$crosshair = this.$id('crosshair');

      if (this.model.lines.length
        && this.model.orders.length
        && !this.el.querySelector('.is-lineOrder'))
      {
        this.model.generate();
      }
    },

    renderLineOrders: function()
    {
      var view = this;
      var selector = '#' + view.idPrefix + '-lineOrders';

      view.removeView(selector);

      view.model.lines.forEach(function(dailyMrpPlanLine)
      {
        var lineOrdersView = new DailyMrpPlanLineOrdersView({model: dailyMrpPlanLine});

        view.listenTo(dailyMrpPlanLine.orders, 'reset', view.onLineOrdersReset);
        view.insertView(selector, lineOrdersView);

        lineOrdersView.render();
      });

      this.toggleTimeline();
    },

    toggleTimeline: function()
    {
      this.$id('timeline').toggleClass('hidden', !this.el.querySelector('.is-lineOrder'));
    },

    onLineOrderClicked: function(e)
    {
      var orderNo = e.lineOrder.get('orderNo');

      if (this.ordersView.selected === orderNo)
      {
        this.ordersView.unselect();
      }
      else
      {
        this.ordersView.select(orderNo, true);
      }
    },

    onItemEntered: function(e)
    {
      var $item = this.findItemEl(e);

      if (!$item.length)
      {
        return;
      }

      $item.addClass('is-highlighted');

      scrollIntoView($item[0]);
    },

    onItemLeft: function(e)
    {
      this.findItemEl(e).removeClass('is-highlighted');
    },

    findItemEl: function(e)
    {
      if (e.type === 'order')
      {
        return this.$('.is-lineOrder[data-id^="' + e.item.id + '"]');
      }

      if (e.type === 'lineOrder')
      {
        return this.$('.is-order[data-id="' + e.item.get('orderNo') + '"]');
      }

      return this.$('#NULL');
    }

  });
});
