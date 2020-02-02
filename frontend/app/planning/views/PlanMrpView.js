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
  './PlanMrpLateOrdersView',
  './PlanMrpLineOrdersView',
  './PlanMrpLineOrdersListView',
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
  PlanMrpLateOrdersView,
  PlanMrpLineOrdersView,
  PlanMrpLineOrdersListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'plan',

    events: {

      'mouseleave #-lineOrders': function()
      {
        if (!this.plan.displayOptions.isLineOrdersListEnabled())
        {
          this.$els.crosshair.addClass('hidden');
          this.$els.time.addClass('hidden');
        }
      },

      'mouseenter #-lineOrders': function()
      {
        if (!this.plan.displayOptions.isLineOrdersListEnabled())
        {
          this.$els.crosshair.removeClass('hidden');
          this.$els.time.removeClass('hidden');
        }
      },

      'mousemove .planning-mrp-lineOrders-container': function(e)
      {
        if (this.plan.displayOptions.isLineOrdersListEnabled())
        {
          return;
        }

        var shiftDurationMs = 8 * 3600 * 1000;
        var timeLeftOffsetPx = 132;
        var timeCenterOffsetPx = 50;
        var offsetLeft = 15 + 100 + 32;

        var crosshairEl = this.$els.crosshair[0];
        var timeEl = this.$els.time[0];
        var pos = this.$els.lineOrders.position();
        var shiftWidthPx = this.$els.lineOrders.outerWidth() - timeLeftOffsetPx;
        var timeLeftPx = e.pageX - pos.left - timeLeftOffsetPx;
        var timeMultiplier = timeLeftPx / shiftWidthPx;
        var genericTimeMs = shiftDurationMs * timeMultiplier;
        var shiftStartTime = +this.$(e.target).closest('.planning-mrp-lineOrders-list').attr('data-shift-start-time');
        var shiftTimeMs = shiftStartTime + genericTimeMs;
        var maxTimeLeftPx = shiftWidthPx - timeCenterOffsetPx * 2 + 15;

        crosshairEl.style.height = (this.$els.lineOrders.outerHeight() + 6) + 'px';
        crosshairEl.style.top = pos.top + 'px';
        crosshairEl.style.left = Math.max(offsetLeft, e.pageX) + 'px';

        timeLeftPx -= timeCenterOffsetPx;

        timeEl.style.left = Math.min(timeLeftPx, maxTimeLeftPx) + 'px';
        timeEl.innerHTML = time.toString(genericTimeMs / 1000, true)
          + '<br>'
          + (shiftTimeMs ? time.utc.format(shiftTimeMs, 'HH:mm:ss') : '');

        crosshairEl.classList.toggle('hidden', !shiftTimeMs);
        timeEl.classList.toggle('hidden', !shiftTimeMs);
      },
      'contextmenu': function()
      {
        return false;
      }

    },

    initialize: function()
    {
      var view = this;

      view.$els = {
        lineOrders: null,
        timeline: null,
        crosshair: null,
        time: null
      };

      view.listenTo(view.plan, 'change:loading', this.onLoadingChanged);
      view.listenTo(view.plan.displayOptions, 'change:lineOrdersList', this.onLineOrdersListChanged);
      view.listenTo(view.plan.settings, 'changed', this.onSettingsChanged);

      view.setView('#-toolbar', new PlanMrpToolbarView({
        delayReasons: view.delayReasons,
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
      view.setView('#-lateOrders', new PlanMrpLateOrdersView({
        delayReasons: view.delayReasons,
        plan: view.plan,
        mrp: view.mrp
      }));
    },

    destroy: function()
    {
      var view = this;

      Object.keys(view.$els).forEach(function(k)
      {
        view.$els[k] = null;
      });
    },

    getTemplateData: function()
    {
      return {
        lockReason: this.serializeMrpLockReason(),
        mrp: {
          _id: this.mrp.id,
          name: this.mrp.id,
          description: this.mrp.get('description')
        }
      };
    },

    serializeMrpLockReason: function()
    {
      var view = this;
      var lockReason = view.plan.settings.getMrpLockReason(view.mrp.id);

      if (!lockReason)
      {
        return '';
      }

      var title = [];

      if (lockReason.mrp)
      {
        title.push(view.t('lockReason:mrp', {mrp: view.mrp.id}));
      }

      lockReason.lines.forEach(function(lockedLine)
      {
        title.push(view.t('lockReason:line', {
          line: lockedLine.line,
          mrps: lockedLine.mrps.join(', ')
        }));
      });

      return title.join('\n');
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    afterRender: function()
    {
      var view = this;

      Object.keys(view.$els).forEach(function(k)
      {
        view.$els[k] = view.$id(k);
      });

      view.$els.timeline.toggleClass(
        'hidden',
        view.mrp.lines.length === 0 || view.plan.displayOptions.isLineOrdersListEnabled()
      );

      view.renderLineOrders();
    },

    renderLineOrders: function()
    {
      var view = this;

      view.removeView('#-lineOrders');

      if (view.plan.displayOptions.isLineOrdersListEnabled())
      {
        view.renderLineOrdersList();

        return;
      }

      [].concat(view.mrp.lines.models)
        .sort(function(a, b)
        {
          return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
        })
        .forEach(function(line)
        {
          view.insertView('#-lineOrders', new PlanMrpLineOrdersView({
            plan: view.plan,
            mrp: view.mrp,
            line: line,
            prodLineState: view.prodLineStates.get(line.id)
          })).render();
        });
    },

    renderLineOrdersList: function()
    {
      this.setView('#-lineOrders', new PlanMrpLineOrdersListView({
        plan: this.plan,
        mrp: this.mrp,
        mode: 'plan'
      })).render();
    },

    onLoadingChanged: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.timers.render = setTimeout(this.render.bind(this), 1);
      }
    },

    onLineOrdersListChanged: function()
    {
      if (!this.$els.timeline)
      {
        return;
      }

      var hidden = this.plan.displayOptions.isLineOrdersListEnabled();

      this.$els.timeline.toggleClass('hidden', hidden);
      this.$els.crosshair.toggleClass('hidden', hidden);
      this.$els.time.toggleClass('hidden', hidden);

      this.renderLineOrders();
    },

    onSettingsChanged: function(changes)
    {
      if (changes.locked)
      {
        this.$el.toggleClass('is-locked', this.plan.settings.isMrpLocked(this.mrp.id));
      }
    }

  });
});
