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

    fteType: 'dirIndir',

    extremesChangeProperties: ['maxDirIndirFte', 'maxDirIndirPercent'],

    serializeChartData: function()
    {
      var report = this.model;

      return {
        direct: report.get('totals').direct,
        indirect: report.get('totals').indirect,
        dirIndir: report.get('dirIndir')
      };
    },

    getYAxisMaxValues: function()
    {
      return [
        this.displayOptions.get('maxDirIndirFte') || null,
        this.displayOptions.get('maxDirIndirPercent') || null
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
          id: 'dirIndir',
          name: t.bound('reports', 'hr:dirIndir'),
          color: this.settings.getColor('dirIndir'),
          type: 'line',
          yAxis: 1,
          data: chartData.dirIndir,
          visible: this.displayOptions.isSeriesVisible('dirIndir'),
          tooltip: {
            valueSuffix: '%',
            valueDecimals: 1
          }
        }
      ];
    }

  });
});
