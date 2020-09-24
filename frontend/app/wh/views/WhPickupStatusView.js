// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/data/localStorage',
  'app/planning/util/shift',
  'app/wh/WhOrder',
  'app/wh/templates/pickup/status'
], function(
  _,
  View,
  localStorage,
  shiftUtil,
  WhOrder,
  template
) {
  'use strict';

  var EXPANDED_CLASS = 'wh-pickup-status-expanded';
  var STORAGE_KEY = 'WMES_WH_PICKUP_STATUS_EXPANDED';

  return View.extend({

    template: template,

    events: {

      'click': function()
      {
        this.$el.toggleClass(EXPANDED_CLASS);

        this.updateStats();
        this.updatePadding();

        if (this.$el.hasClass(EXPANDED_CLASS))
        {
          localStorage.setItem(STORAGE_KEY, '1');
        }
        else
        {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

    },

    initialize: function()
    {
      this.scheduleStatsUpdate = _.throttle(this.updateStats.bind(this), 1000);

      this.statsCache = null;
      this.oldPadding = null;

      this.listenTo(this.model, 'change:funcs', this.updateStatus);
      this.listenTo(this.whLines, 'change:pickup change:startedPlan', this.scheduleStatsUpdate);
      this.listenTo(this.whOrders, 'change:status change:funcs', this.scheduleStatsUpdate);
      this.listenTo(this.whOrders, 'reset', this.updateStats);
    },

    getTemplateData: function()
    {
      return {
        expanded: localStorage.getItem(STORAGE_KEY) === '1',
        funcs: this.model.get('funcs')
      };
    },

    destroy: function()
    {
      if (this.oldPadding !== null)
      {
        document.body.style.paddingBottom = this.oldPadding;
      }
    },

    beforeRender: function()
    {
      this.statsCache = null;

      if (this.oldPadding === null)
      {
        this.oldPadding = document.body.style.paddingBottom;
      }
    },

    afterRender: function()
    {
      this.updateStats();
      this.updatePadding();
    },

    updatePadding: function()
    {
      document.body.style.paddingBottom = this.$el.outerHeight() + 'px';
    },

    updateStatus: function()
    {
      var funcs = this.model.get('funcs');

      this.$('.wh-pickup-status-func').each(function()
      {
        this.classList.toggle('is-ready', funcs[this.dataset.func]);
      });
    },

    updateStats: function()
    {
      if (!this.el.classList.contains(EXPANDED_CLASS))
      {
        return;
      }

      var stats = {};

      WhOrder.FUNC_LIST.forEach(function(func)
      {
        stats[func] = {
          pending: {sets: {}, orders: 0, qty: 0},
          started: {sets: {}, orders: 0, qty: 0}
        };
      });

      var ignorePsStatus = this.whSettings.getValue('planning.ignorePsStatus') || [];
      var psPickupStatus = this.whSettings.getValue('planning.psPickupStatus') || [];
      var sets = {};
      var lines = {};

      this.whOrders.forEach(function(whOrder)
      {
        var set = whOrder.get('set');

        whOrder.get('lines').forEach(function(line)
        {
          lines[line._id] = true;
        });

        if (!set)
        {
          return;
        }

        if (!sets[set])
        {
          sets[set] = [];
        }

        sets[set].push(whOrder);
      });

      this.whOrders.forEach(function(whOrder)
      {
        var status = whOrder.get('status');

        if (status === 'finished' || status === 'cancelled')
        {
          return;
        }

        var ps = whOrder.get('psStatus') !== 'unknown';

        if (ps && status === 'pending' && _.includes(ignorePsStatus, whOrder.get('psStatus')))
        {
          return;
        }

        var setOrders = sets[whOrder.get('set')] || [];
        var setId = whOrder.get('set') + '_' + whOrder.get('date');
        var qty = whOrder.get('qty');
        var funcs = whOrder.get('funcs');
        var fmx = funcs[WhOrder.FUNC_TO_INDEX.fmx];
        var kitter = funcs[WhOrder.FUNC_TO_INDEX.kitter];
        var psPickupReady = setOrders.every(function(setOrder)
        {
          var psStatus = setOrder.get('psStatus');

          return psStatus === 'unknown' || _.includes(psPickupStatus, psStatus);
        });

        funcs.forEach(function(func)
        {
          if (func.status === 'finished'
            || func.picklist === 'ignore'
            || (!ps && func._id === 'painter'))
          {
            return;
          }

          if (func._id === 'painter')
          {
            if (whOrder.get('psDistStatus') !== 'pending')
            {
              return;
            }

            if (!func.user && !psPickupReady)
            {
              return;
            }

            if (setOrders.length === 0)
            {
              return;
            }
          }
          else if (func._id === 'packer')
          {
            if (whOrder.get('packStatus') !== 'pending')
            {
              return;
            }

            if (setOrders.length === 0)
            {
              return;
            }
          }
          else if (whOrder.get('fifoStatus') !== 'pending')
          {
            return;
          }
          else if (func._id === 'platformer' && (fmx.carts.length === 0 || kitter.status !== 'finished'))
          {
            return;
          }

          var status = func.user ? 'started' : 'pending';
          var funcStats = stats[func._id][status];

          funcStats.sets[setId] = 1;
          funcStats.orders += 1;
          funcStats.qty += qty;
        });
      });

      if (!this.statsCache)
      {
        this.cacheStats();
      }

      var statsCache = this.statsCache;
      var maxSetsPerLine = this.whSettings.getValue('planning.maxSetsPerLine') || 2;
      var todayPlan = shiftUtil.getPlanDate(Date.now()).valueOf();
      var pendingSets = 0;

      this.whLines.forEach(function(whLine)
      {
        if (!lines[whLine.id] || Date.parse(whLine.get('startedPlan')) < todayPlan)
        {
          return;
        }

        pendingSets += Math.max(0, maxSetsPerLine - whLine.get('pickup').total.sets);
      });

      WhOrder.FUNC_LIST.forEach(function(func)
      {
        var funcStats = stats[func];

        Object.keys(funcStats).forEach(function(status)
        {
          var statusStats = funcStats[status];

          statusStats.sets = status === 'pending' && (func === 'fmx' || func === 'kitter')
            ? pendingSets
            : Object.keys(statusStats.sets).length;

          Object.keys(statusStats).forEach(function(stat)
          {
            var key = func + ':' + status + ':' + stat;
            var value = statusStats[stat];

            statsCache[key].textContent = typeof value === 'number' ? value.toLocaleString() : value;
          });
        });
      });
    },

    cacheStats: function()
    {
      var statsCache = {};

      this.$('td[data-stat]').each(function()
      {
        statsCache[this.dataset.stat] = this;
      });

      this.statsCache = statsCache;
    }

  });
});
