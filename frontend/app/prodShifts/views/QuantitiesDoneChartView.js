// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  _,
  time,
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;

      this.listenTo(this.model, 'change:quantitiesDone', this.updateChart);
    },

    destroy: function()
    {
      if (this.chart !== null)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    afterRender: function()
    {
      if (!this.chart)
      {
        setTimeout(this.createChart.bind(this), 1);
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el
        },
        title: {
          text: t('prodShifts', 'charts:quantitiesDone:title'),
          style: {
            fontSize: '18px',
            color: '#333'
          }
        },
        noData: {},
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        xAxis: {
          categories: chartData.categories
        },
        yAxis: {
          title: false
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true
            },
            tooltip: {
              valueSuffix: t('prodShifts', 'charts:quantitiesDone:unit')
            }
          }
        },
        series: [{
          name: t('prodShifts', 'charts:quantitiesDone:series:planned'),
          type: 'column',
          data: chartData.planned
        }, {
          name: t('prodShifts', 'charts:quantitiesDone:series:actual'),
          type: 'column',
          data: chartData.actual
        }]
      });

      this.chart.reflow();
    },

    updateChart: function()
    {
      if (!this.chart)
      {
        return;
      }

      var chartData = this.serializeChartData();

      this.chart.series[0].setData(chartData.planned, true);
      this.chart.series[1].setData(chartData.actual, true);
    },

    serializeChartData: function()
    {
      var chartData = {
        categories: [],
        planned: [],
        actual: []
      };

      var category = Date.parse(this.model.get('date'));

      for (var i = 0; i < 8; ++i)
      {
        chartData.categories.push(time.format(category, 'HH:mm'));

        category += 3600 * 1000;
      }

      this.model.get('quantitiesDone').forEach(function(quantitiesDone)
      {
        chartData.planned.push(quantitiesDone.planned);
        chartData.actual.push(quantitiesDone.actual);
      });

      return chartData;
    }

  });
});
