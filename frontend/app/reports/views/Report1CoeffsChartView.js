define([
  'underscore',
  'jquery',
  'd3',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  'app/highcharts'
], function(
  _,
  $,
  d3,
  time,
  t,
  viewport,
  View,
  renderOrgUnitPath,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-1-coeffs';
    },

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:coeffs', this.render);
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

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var orgUnit = this.model.get('orgUnit');
      var formatTooltipHeader = this.formatTooltipHeader.bind(this);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          resetZoomButton: {
            relativeTo: 'chart',
            position: {
              y: 0
            }
          }
        },
        title: {
          text: orgUnit
            ? renderOrgUnitPath(orgUnit, false, false)
            : t('reports', 'report1:overallTitle')
        },
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [
          {
            title: false
          },
          {
            title: false,
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function()
          {
            var str = '<b>' + formatTooltipHeader(this.x) +'</b><table>';

            $.each(this.points, function(i, point)
            {
              str += '<tr><td style="color: ' + point.series.color + '">'
                + point.series.name + ':</td><td>'
                + point.y + point.series.tooltipOptions.valueSuffix
                + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          backgroundColor: '#FFFFFF',
          itemStyle: {
            fontSize: '10px'
          }
        },
        plotOptions: {
          area: {
            lineWidth: 0,
            marker: {
              radius: 0,
              states: {
                hover: {
                  radius: 3
                }
              }
            }
          },
          line: {
            lineWidth: 1,
            marker: {
              radius: 0,
              states: {
                hover: {
                  radius: 3
                }
              }
            }
          }
        },
        series: [
          {
            name: t('reports', 'coeffs:quantityDone'),
            color: '#00aaff',
            type: 'area',
            yAxis: 0,
            data: chartData.quantityDone,
            tooltip: {
              valueSuffix: t('reports', 'quantityDoneSuffix')
            }
          },
          {
            name: t('reports', 'coeffs:downtime'),
            color: 'rgba(255, 0, 0, .75)',
            borderColor: '#AC2925',
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.downtime,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour'
          },
          {
            name: t('reports', 'coeffs:efficiency'),
            color: '#00ee00',
            type: 'line',
            yAxis: 1,
            data: chartData.efficiency,
            tooltip: {
              valueSuffix: '%'
            }
          },
          {
            name: t('reports', 'coeffs:productivity'),
            color: '#ffaa00',
            type: 'line',
            yAxis: 1,
            data: chartData.productivity,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour'
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var yAxis1Options = {min: 0, max: 100};

      if (!chartData.quantityDone.length)
      {
        yAxis1Options.min = null;
        yAxis1Options.max = null;
      }

      this.chart.yAxis[1].update(yAxis1Options);

      var visible = this.model.query.get('interval') !== 'hour';

      this.chart.series[1].update({visible: visible});
      this.chart.series[3].update({visible: visible});

      this.chart.series[0].setData(chartData.quantityDone, false);
      this.chart.series[1].setData(chartData.downtime, false);
      this.chart.series[2].setData(chartData.efficiency, false);
      this.chart.series[3].setData(chartData.productivity, true);
    },

    serializeChartData: function()
    {
      return this.model.get('coeffs');
    },

    formatTooltipHeader: function(epoch)
    {
      /*jshint -W015*/

      var timeMoment = time.getMoment(epoch);
      var interval = this.model.query.interval || 'hour';
      var data;

      if (interval === 'shift')
      {
        data = {
          shift:
            t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
        };
      }

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, data));
    },

    onModelLoading: function()
    {
      this.loading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    }

  });
});
