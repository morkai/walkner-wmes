// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/prodShifts/views/QuantitiesDoneChartView'
], function(
  QuantitiesDoneChartView
) {
  'use strict';

  return QuantitiesDoneChartView.extend({

    createChartOptions: function()
    {
      var options = QuantitiesDoneChartView.prototype.createChartOptions.apply(this, arguments);

      options.chart.height = 285;
      options.chart.zoomType = false;
      options.title = null;
      options.legend.enabled = false;
      options.exporting.enabled = false;
      options.noData.enabled = false;
      options.yAxis.labels = {
        enabled: false
      };
      options.series[1].color = '#00e696';

      return options;
    }

  });
});
