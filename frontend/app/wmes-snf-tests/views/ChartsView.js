// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View'
], function(
  $,
  t,
  time,
  Highcharts,
  View
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
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
      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();
      }
    },

    createChart: function()
    {
      var chartData = this.model.get('tags');

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          height: 350
        },
        title: false,
        noData: {},
        exporting: {
          enabled: false
        },
        xAxis: {
          type: 'linear',
          tickInterval: 1
        },
        yAxis: [
          {
            title: {
              text: this.t('charts:current')
            }
          },
          {
            title: {
              text: this.t('charts:voltage')
            }
          },
          {
            title: {
              text: this.t('charts:temperature')
            },
            opposite: true
          },
          {
            title: {
              text: this.t('charts:light')
            },
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function()
          {
            var str = '<b>' + time.toString(this.x, true) + '</b><table>';

            $.each(this.points, function(i, point)
            {
              str += '<tr><td style="color: ' + point.series.color + '">'
              + point.series.name + ':</td><td>'
              + point.y + (point.series.tooltipOptions.valueSuffix || '')
              + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          line: {
            lineWidth: 1.5,
            pointInterval: 1,
            pointStart: 0,
            marker: {
              radius: 0,
              symbol: 'circle',
              lineWidth: 0,
              states: {
                hover: {
                  radius: 4
                }
              }
            }
          }
        },
        series: [
          {
            name: this.t('charts:current'),
            type: 'line',
            yAxis: 0,
            data: chartData.current,
            tooltip: {
              valueSuffix: this.t('charts:current:suffix')
            }
          },
          {
            name: this.t('charts:voltage'),
            type: 'line',
            yAxis: 1,
            data: chartData.voltage,
            tooltip: {
              valueSuffix: this.t('charts:voltage:suffix')
            }
          },
          {
            name: this.t('charts:temperature'),
            type: 'line',
            yAxis: 2,
            data: chartData.temperature,
            tooltip: {
              valueSuffix: this.t('charts:temperature:suffix')
            }
          },
          {
            name: this.t('charts:light1'),
            type: 'line',
            yAxis: 3,
            data: chartData.light1
          },
          {
            name: this.t('charts:light2'),
            type: 'line',
            yAxis: 3,
            data: chartData.light2
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.model.get('tags');

      this.chart.series[0].setData(chartData.current, false);
      this.chart.series[1].setData(chartData.voltage, false);
      this.chart.series[2].setData(chartData.temperature, false);
      this.chart.series[3].setData(chartData.light1, false);
      this.chart.series[4].setData(chartData.light2, true);
    }

  });
});
