// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  './Report1CoeffsChartView',
  './Report1DowntimesChartView',
  'app/reports/templates/report1Charts'
], function(
  View,
  Report1CoeffsChartView,
  Report1DowntimesChartView,
  report1ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report1ChartsTemplate,

    initialize: function()
    {
      var skipRenderCharts = this.options.skipRenderCharts;

      this.setView(
        '.reports-1-coeffs-container',
        new Report1CoeffsChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByAor-container',
        new Report1DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByAor',
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByReason-container',
        new Report1DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByReason',
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
        })
      );
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
