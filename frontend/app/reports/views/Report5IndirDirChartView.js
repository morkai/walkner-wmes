// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  './Report5FteChartView'
], function(
  _,
  t,
  Report5FteChartView
) {
  'use strict';

  return Report5FteChartView.extend({

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
