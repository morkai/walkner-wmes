// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  './Report5TotalsChartView',
  './Report5DirectChartView',
  './Report5IndirectChartView',
  './Report5DirIndirChartView',
  './Report5DetailsChartView',
  'app/reports/templates/report5Charts'
], function(
  View,
  Report5TotalsChartView,
  Report5DirectChartView,
  Report5IndirectChartView,
  Report5DirIndirChartView,
  Report5DetailsChartView,
  report5ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report5ChartsTemplate,

    initialize: function()
    {
      var options = {
        model: this.model,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderChart: this.options.skipRenderCharts
      };

      this.setView('.reports-5-totals-container', new Report5TotalsChartView(options));
      this.setView('.reports-5-direct-container', new Report5DirectChartView(options));
      this.setView('.reports-5-indirect-container', new Report5IndirectChartView(options));
      this.setView('.reports-5-dirIndir-container', new Report5DirIndirChartView(options));
      this.setView('.reports-5-details-container', new Report5DetailsChartView(options));
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
