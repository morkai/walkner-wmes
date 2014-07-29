// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  './Report2ClipChartView',
  './Report2DirIndirChartView',
  './Report2EffIneffChartView',
  'app/reports/templates/report2Charts'
], function(
  View,
  Report2ClipChartView,
  Report2DirIndirChartView,
  Report2EffIneffChartView,
  report2ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report2ChartsTemplate,

    initialize: function()
    {
      this.setView(
        '.reports-2-clip-container',
        new Report2ClipChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-2-dirIndir-container',
        new Report2DirIndirChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-2-effIneff-container',
        new Report2EffIneffChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
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
