// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/data/orgUnits',
  './PlanMrpToolbarView',
  './PlanMrpLinesView',
  './PlanMrpOrdersView',
  './PlanMrpLineOrdersView',
  'app/planning/templates/planMrp'
], function(
  _,
  time,
  t,
  user,
  View,
  orgUnits,
  PlanMrpToolbarView,
  PlanMrpLinesView,
  PlanMrpOrdersView,
  PlanMrpLineOrdersView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'mouseleave #-lineOrders': function()
      {
        this.$crosshair.addClass('hidden');
        this.$time.addClass('hidden');
      },

      'mouseenter #-lineOrders': function()
      {
        this.$crosshair.removeClass('hidden');
        this.$time.removeClass('hidden');
      },

      'mousemove .planning-mrp-lineOrders-list': function(e)
      {
        var shiftDurationMs = 8 * 3600 * 1000;
        var timeLeftOffsetPx = 132;
        var timeCenterOffsetPx = 50;

        var crosshairEl = this.$crosshair[0];
        var timeEl = this.$time[0];
        var pos = this.$lineOrders.position();
        var shiftWidthPx = this.$lineOrders.outerWidth() - timeLeftOffsetPx;
        var timeLeftPx = e.pageX - pos.left - timeLeftOffsetPx;
        var timeMultiplier = timeLeftPx / shiftWidthPx;
        var genericTimeMs = shiftDurationMs * timeMultiplier;
        var shiftTimeMs = +e.currentTarget.dataset.shiftStartTime + genericTimeMs;
        var maxTimeLeftPx = shiftWidthPx - timeCenterOffsetPx * 2 + 15;

        crosshairEl.style.height = (this.$lineOrders.outerHeight() + 6) + 'px';
        crosshairEl.style.top = pos.top + 'px';
        crosshairEl.style.left = e.pageX + 'px';

        timeLeftPx -= timeCenterOffsetPx;

        timeEl.style.left = Math.min(timeLeftPx, maxTimeLeftPx) + 'px';
        timeEl.innerHTML = time.toString(genericTimeMs / 1000, true)
          + '<br>'
          + time.utc.format(shiftTimeMs, 'HH:mm:ss');
      }

    },

    initialize: function()
    {
      var view = this;

      view.setView('#-toolbar', new PlanMrpToolbarView({
        plan: view.plan,
        mrp: view.mrp
      }));
      view.setView('#-lines', new PlanMrpLinesView({
        plan: view.plan,
        mrp: view.mrp
      }));
      view.setView('#-orders', new PlanMrpOrdersView({
        plan: view.plan,
        mrp: view.mrp
      }));
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        mrp: {
          name: this.mrp.id,
          description: this.mrp.get('description')
        }
      };
    },

    afterRender: function()
    {
      this.$lineOrders = this.$id('lineOrders');
      this.$crosshair = this.$id('crosshair');
      this.$time = this.$id('time');

      this.$id('timeline').toggleClass('hidden', this.mrp.lines.length === 0);

      this.renderLineOrders();
    },

    renderLineOrders: function()
    {
      var view = this;

      view.removeView('#-lineOrders');

      view.mrp.lines.forEach(function(line)
      {
        view.insertView('#-lineOrders', new PlanMrpLineOrdersView({
          plan: view.plan,
          mrp: view.mrp,
          line: line
        })).render();
      });
    }

  });
});
