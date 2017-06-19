// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './TotalsChartView',
  './DirectChartView',
  './IndirectChartView',
  './IndirDirChartView',
  './DetailsChartView',
  './DirIndirChartView',
  './EffIneffChartView',
  'app/reports/templates/5/charts'
], function(
  View,
  TotalsChartView,
  DirectChartView,
  IndirectChartView,
  IndirDirChartView,
  DetailsChartView,
  DirIndirChartView,
  EffIneffChartView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      var options = {
        model: this.model,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderChart: this.options.skipRenderCharts
      };

      this.setView('.reports-5-totals-container', new TotalsChartView(options));
      this.setView('.reports-5-direct-container', new DirectChartView(options));
      this.setView('.reports-5-indirect-container', new IndirectChartView(options));
      this.setView('.reports-5-indirDir-container', new IndirDirChartView(options));
      this.setView('.reports-5-details-container', new DetailsChartView(options));
      this.setView('.reports-5-dirIndir-container', new DirIndirChartView(options));
      this.setView('.reports-5-effIneff-container', new EffIneffChartView(options));
    },

    afterRender: function()
    {
      if (!this.options.skipRenderCharts)
      {
        this.promised(this.model.fetch());
      }

      var orgUnitType = this.model.get('orgUnitType');

      this.$el.attr('data-orgUnitType', orgUnitType);
      this.$el.attr('data-orgUnitId', orgUnitType ? this.model.get('orgUnit').id : undefined);
    },

    renderCharts: function(load)
    {
      this.getViews().forEach(function(view)
      {
        view.render();
      });

      if (load)
      {
        this.promised(this.model.fetch());
      }
    },

    reflowCharts: function()
    {
      this.getViews().forEach(function(view)
      {
        if (view.chart)
        {
          view.chart.reflow();
        }
      });
    }

  });
});
