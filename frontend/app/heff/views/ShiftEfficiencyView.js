// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/prodShiftOrders/ProdShiftOrder',
  './ExecutionTimelineView',
  'app/heff/templates/shiftEfficiency'
], function(
  time,
  View,
  downtimeReasons,
  ProdShiftOrder,
  ShiftTimelineView,
  template
) {
  'use strict';

  return View.extend({

    swapDelay: 20000,

    template: template,

    initialize: function()
    {
      this.debug = window.ENV !== 'production';
      this.currentMetrics = 'tt';

      this.todoView = new ShiftTimelineView({
        mode: 'todo',
        model: {
          todo: this.model.planShiftOrders,
          done: this.model.prodShiftOrders
        }
      });
      this.doneView = new ShiftTimelineView({
        mode: 'done',
        model: {
          todo: this.model.planShiftOrders,
          done: this.model.prodShiftOrders
        }
      });

      this.listenTo(this.model.prodShiftOrders, 'reset add change', this.updateData);

      this.setView('#-todo', this.todoView);
      this.setView('#-done', this.doneView);
    },

    getTitle: function()
    {
      return this.t('shift:title');
    },

    activate: function()
    {
      this.swapMetrics();
      this.updateData();
    },

    deactivate: function()
    {
      this.currentMetrics = 'tt';

      clearTimeout(this.timers.swapMetrics);
    },

    updateData: function()
    {
      this.updatePlanned();
      this.updateActual();
      this.updateLineEff();
    },

    periodicUpdate: function()
    {
      this.updateActual();
    },

    updatePlanned: function()
    {
      var text = '?';
      var pso = this.model.prodShiftOrders.last();

      if (pso)
      {
        var sapTaktTime = pso.get('sapTaktTime');

        if (sapTaktTime)
        {
          text = time.toString(pso.get('sapTaktTime'), true, false).replace(/^00:/, '');
        }
      }

      this.$id('plannedTt').text(text);
    },

    updateActual: function()
    {
      var actualTtText = '?';
      var orderEffText = '?';
      var icon = 'fa-meh-o';
      var pso = this.model.prodShiftOrders.last();

      if (pso)
      {
        var now = Date.now();
        var workDuration = pso.get('workDuration');
        var quantityDone = pso.get('quantityDone') || 1;

        if (this.debug)
        {
          console.log({
            workDuration: workDuration,
            quantityDone: quantityDone,
            now: new Date(now)
          });
        }

        if (workDuration > 0)
        {
          workDuration *= 3600000;
        }
        else
        {
          var startedAt = Date.parse(pso.get('startedAt'));
          var finishedAt = Date.parse(pso.get('finishedAt')) || now;

          workDuration = finishedAt - startedAt;

          this.model.prodDowntimes.forEach(function(pdt)
          {
            if (pdt.get('prodShiftOrder') !== pso.id)
            {
              return;
            }

            var reason = downtimeReasons.get(pdt.get('reason'));

            if (reason && reason.get('type') !== 'break')
            {
              return;
            }

            var startedAt = Date.parse(pdt.get('startedAt'));
            var finishedAt = pdt.get('finishedAt') ? Date.parse(pdt.get('finishedAt')) : now;

            workDuration -= finishedAt - startedAt;
          });

          if (this.debug)
          {
            console.log({
              workDuration: workDuration,
              startedAt: new Date(startedAt),
              finishedAt: new Date(finishedAt),
              prodDowntimes: this.model.prodDowntimes
            });
          }
        }

        var plannedTt = pso.get('sapTaktTime');
        var actualTt = workDuration / quantityDone / 1000;

        actualTtText = time.toString(actualTt, true, false).replace(/^00:/, '');

        if (actualTt <= plannedTt)
        {
          icon = 'fa-smile-o';
        }
        else if (actualTt > plannedTt)
        {
          icon = 'fa-frown-o';
        }

        if (this.debug)
        {
          console.log({
            plannedTt: plannedTt,
            actualTt: actualTt
          });
        }

        if (pso.get('quantityDone'))
        {
          var orderEff = pso.getEfficiency({workDuration: workDuration / 3600000});

          if (this.debug)
          {
            console.log({
              orderEff: orderEff,
              quantityDone: pso.get('quantityDone'),
              workDuration: workDuration
            });
          }

          if (orderEff)
          {
            orderEffText = Math.min(999, Math.round(orderEff * 100)) + '%';
          }
        }
      }

      this.$id('actualTt').text(actualTtText);
      this.$id('orderEff').text(orderEffText);

      if (this.debug)
      {
        console.log({
          actualTtText: actualTtText,
          orderEffText: orderEffText
        });
      }

      if (!this.$id('icon').hasClass(icon))
      {
        this.$id('icon').removeClass('fa-meh-o fa-smile-o fa-frown-o').addClass(icon);
      }
    },

    updateLineEff: function()
    {
      var view = this;
      var now = Date.now();
      var effNum = 0;
      var effDen = 0;

      view.model.prodShiftOrders.forEach(function(pso)
      {
        var workDuration = pso.get('workDuration');
        var taktTimeCoeff = ProdShiftOrder.getTaktTimeCoeff(pso.attributes);

        if (!workDuration && !pso.get('finishedAt'))
        {
          workDuration = now - Date.parse(pso.get('startedAt'));

          view.model.prodDowntimes.forEach(function(pdt)
          {
            // TODO downtime reasons of type break from settings
            if (pdt.get('prodShiftOrder') === pso.id && pdt.get('reason') === 'A')
            {
              workDuration -= (Date.parse(pdt.get('finishedAt')) || now) - Date.parse(pdt.get('startedAt'));
            }
          });

          workDuration /= 3600000;
        }

        effNum += pso.get('laborTime') * taktTimeCoeff / 100 * pso.get('quantityDone');
        effDen += workDuration * pso.get('workerCount');
      });

      var eff = Math.min(999, Math.round(effNum / effDen * 100));

      view.$id('lineEff').text(eff > 0 ? (eff + '%') : '?');
    },

    swapMetrics: function()
    {
      if (this.currentMetrics === 'tt')
      {
        this.currentMetrics = 'eff';

        this.updateLineEff();

        this.$id('plannedTt').parent().addClass('hidden');
        this.$id('actualTt').parent().addClass('hidden');
        this.$id('lineEff').parent().removeClass('hidden');
        this.$id('orderEff').parent().removeClass('hidden');
      }
      else
      {
        this.currentMetrics = 'tt';

        this.$id('lineEff').parent().addClass('hidden');
        this.$id('orderEff').parent().addClass('hidden');
        this.$id('plannedTt').parent().removeClass('hidden');
        this.$id('actualTt').parent().removeClass('hidden');
      }

      // this.timers.swapMetrics = setTimeout(this.swapMetrics.bind(this), 5000);
    }

  });
});
