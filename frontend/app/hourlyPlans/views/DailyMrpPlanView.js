// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  '../util/scrollIntoView',
  './DailyMrpPlanToolbarView',
  './DailyMrpPlanLinesView',
  './DailyMrpPlanOrdersView',
  './DailyMrpPlanLineOrdersView',
  'app/hourlyPlans/templates/dailyMrpPlans/plan',
  'app/hourlyPlans/templates/dailyMrpPlans/_overlappingLineMessage'
], function(
  _,
  View,
  scrollIntoView,
  DailyMrpPlanToolbarView,
  DailyMrpPlanLinesView,
  DailyMrpPlanOrdersView,
  DailyMrpPlanLineOrdersView,
  template,
  renderOverlappingLineMessage
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
      var view = this;
      var plan = this.model;
      var lines = plan.lines;
      var orders = plan.orders;

      view.onLineOrdersReset = _.debounce(view.toggleTimeline.bind(view), 1, false);

      view.listenTo(plan, 'reset', view.render);
      view.listenTo(plan, 'itemEntered', view.onItemEntered);
      view.listenTo(plan, 'itemLeft', view.onItemLeft);
      view.listenTo(plan, 'scrollIntoView', view.scrollIntoView);
      view.listenTo(plan, 'overlappingLine', view.addOverlappingLineMessage);
      view.listenTo(plan.collection, 'checkingOverlappingLines', view.removeOverlappingLinesMessages);

      view.listenTo(orders, 'reset', view.generatePlan);
      view.listenTo(orders, 'change:operation change:qtyPlan', view.generatePlan);

      view.listenTo(lines, 'reset', view.renderLineOrders);
      view.listenTo(lines, 'reset', view.generatePlan);
      view.listenTo(lines, 'reset change:activeFrom change:activeTo', view.onLinesChanged);
      view.listenTo(lines, 'change:activeFrom change:activeTo change:workerCount', view.generatePlan);
      view.listenTo(lines, 'lineOrderClicked', view.onLineOrderClicked);

      view.toolbarView = new DailyMrpPlanToolbarView({model: view.model});
      view.linesView = new DailyMrpPlanLinesView({model: view.model.lines});
      view.ordersView = new DailyMrpPlanOrdersView({model: view.model.orders});

      view.setView('#' + view.idPrefix + '-toolbar', view.toolbarView);
      view.setView('#' + view.idPrefix + '-lines', view.linesView);
      view.setView('#' + view.idPrefix + '-orders', view.ordersView);
    },

    generatePlan: function(model, options)
    {
      if (options && options.skipGenerate)
      {
        return;
      }

      if (this.timers.generatePlan)
      {
        clearTimeout(this.timers.generatePlan);
      }

      this.timers.generatePlan = setTimeout(this.model.generate.bind(this.model), 10);
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

    onLinesChanged: function()
    {
      this.model.collection.trigger('checkOverlappingLinesRequested');
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
    },

    scrollIntoView: function()
    {
      this.el.scrollIntoView();
    },

    addOverlappingLineMessage: function(e)
    {
      this.$id('messages').append(renderOverlappingLineMessage({
        line: e.line,
        mrp: e.mrp,
        time1: e.from1 + '-' + e.to1,
        time2: e.from2 + '-' + e.to2
      }));
    },

    removeOverlappingLinesMessages: function()
    {
      this.$('.message[data-message="overlappingLine"]').remove();
    }

  });
});
