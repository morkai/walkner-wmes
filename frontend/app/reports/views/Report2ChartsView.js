define([
  'screenfull',
  'app/i18n',
  'app/core/View',
  './Report2ClipChartView',
  './Report2DirIndirChartView',
  './Report2EffIneffChartView',
  'app/reports/templates/report2Charts'
], function(
  screenfull,
  t,
  View,
  Report2ClipChartView,
  Report2DirIndirChartView,
  Report2EffIneffChartView,
  report2ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report2ChartsTemplate,

    events: {
      'click .highcharts-title': function(e)
      {
        if (!e.ctrlKey || !screenfull.enabled)
        {
          return;
        }

        if (screenfull.isFullscreen)
        {
          screenfull.exit();

          return;
        }

        screenfull.request(this.$(e.target).closest('.reports-chart')[0]);
      }
    },

    initialize: function()
    {
      this.setView(
        '.reports-2-clip-container',
        new Report2ClipChartView({
          model: this.model,
          metricRefs: this.metricRefs,
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-2-dirIndir-container',
        new Report2DirIndirChartView({
          model: this.model,
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-2-effIneff-container',
        new Report2EffIneffChartView({
          model: this.model,
          skipRenderChart: this.options.skipRenderCharts
        })
      );
    },

    afterRender: function()
    {
      if (this.options.renderCharts !== false)
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
