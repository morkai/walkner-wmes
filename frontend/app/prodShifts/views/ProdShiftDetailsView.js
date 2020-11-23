// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/data/downtimeReasons',
  'app/prodShiftOrders/ProdShiftOrder',
  'app/prodShifts/templates/details'
], function(
  _,
  DetailsView,
  downtimeReasons,
  ProdShiftOrder,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.panelType = this.options.panelType || 'primary';

      if (this.prodShiftOrders && this.prodDowntimes)
      {
        this.once('afterRender', function()
        {
          var updateDetails = _.debounce(this.updateDetails.bind(this), 1);

          this.listenTo(this.prodShiftOrders, 'reset add remove change', updateDetails);
          this.listenTo(this.prodDowntimes, 'reset add remove change', updateDetails);
        });
      }
    },

    getTemplateData: function()
    {
      return {
        panelType: this.panelType,
        efficiency: this.calcEfficiency()
      };
    },

    updateDetails: function()
    {
      this.updateEfficiency();
    },

    updatePanelType: function(panelType)
    {
      this.$el.removeClass('panel-' + this.panelType).addClass('panel-' + panelType);

      this.panelType = panelType;
    },

    updateEfficiency: function()
    {
      var eff = this.calcEfficiency();

      this.$('div[data-prop="efficiency"] > .prop-value').text(eff >= 0 ? (eff + '%') : '');

      clearTimeout(this.timers.updateEfficiency);
      this.timers.updateEfficiency = setTimeout(this.updateEfficiency.bind(this), 30000);
    },

    calcEfficiency: function()
    {
      if (!this.prodShiftOrders || !this.prodDowntimes)
      {
        return -1;
      }

      var effNum = 0;
      var effDen = 0;
      var psoToBreaks = {};
      var now = Date.now();

      this.prodDowntimes.forEach(function(dt)
      {
        var reason = downtimeReasons.get(dt.get('reason'));

        if (!reason || reason.get('type') !== 'break')
        {
          return;
        }

        var pso = dt.get('prodShiftOrder');

        if (!pso)
        {
          return;
        }

        if (!psoToBreaks[pso._id])
        {
          psoToBreaks[pso._id] = 0;
        }

        var startedAt = Date.parse(dt.get('startedAt'));
        var finishedAt = Date.parse(dt.get('finishedAt')) || now;

        psoToBreaks[pso._id] += finishedAt - startedAt;
      });

      this.prodShiftOrders.forEach(function(pso)
      {
        var workDuration = pso.get('workDuration');
        var taktTimeCoeff = ProdShiftOrder.getTaktTimeCoeff(pso.attributes);

        if (!workDuration && !pso.get('finishedAt'))
        {
          workDuration = (now - Date.parse(pso.get('startedAt')) - (psoToBreaks[pso.id] || 0)) / 3600000;
        }

        effNum += pso.get('laborTime') * taktTimeCoeff / 100 * pso.get('quantityDone');
        effDen += workDuration * pso.get('workerCount');
      });

      return Math.min(999, Math.round(effNum / effDen * 100));
    }

  });
});
