// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  './FteChartView'
], function(
  _,
  t,
  FteChartView
) {
  'use strict';

  return FteChartView.extend({

    fteType: 'indirDir',

    extremesChangeProperties: ['maxIndirDirFte', 'maxIndirDirPercent'],

    serializeChartData: function()
    {
      var report = this.model;

      return {
        direct: report.get('totals').direct,
        indirect: report.get('totals').indirect,
        indirDir: report.get('indirDir')
      };
    },

    getYAxisMaxValues: function()
    {
      return [
        this.displayOptions.get('maxIndirDirFte') || null,
        this.displayOptions.get('maxIndirDirPercent') || null
      ];
    },

    createYAxis: function()
    {
      return [
        {title: false, min: 0},
        {title: false, min: 0, opposite: true, labels: {format: '{value}%'}}
      ];
    },

    createSeries: function(chartData)
    {
      return [
        this.createFteSeries('direct', chartData.direct),
        this.createFteSeries('indirect', chartData.indirect),
        {
          id: 'indirDir',
          name: t.bound('reports', 'hr:indirDir'),
          color: this.settings.getColor('dirIndir'),
          type: 'line',
          yAxis: 1,
          data: chartData.indirDir,
          visible: this.displayOptions.isSeriesVisible('indirDir'),
          tooltip: {
            valueSuffix: '%',
            valueDecimals: 1
          }
        }
      ];
    }

  });
});
