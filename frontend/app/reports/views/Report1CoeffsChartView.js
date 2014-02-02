define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  'app/highcharts'
], function(
  _,
  $,
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
      this.shouldRenderChart = !this.options.skipRenderChart;
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
      else if (this.shouldRenderChart)
      {
        this.createChart();

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var formatTooltipHeader = this.formatTooltipHeader.bind(this);
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var view = this;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          resetZoomButton: {
            relativeTo: 'chart',
            position: {
              y: 5
            }
          },
          events: {
            selection: function(e)
            {
              if (e.resetSelection)
              {
                view.timers.resetExtremes = setTimeout(
                  this.yAxis[1].setExtremes.bind(this.yAxis[1], 0, null, true, false), 1
                );
              }
            }
          }
        },
        title: {
          useHTML: true,
          text: this.getTitle()
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
            opposite: true,
            gridLineWidth: 0
          }
        ],
        tooltip: {
          borderColor: '#999999',
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
            marker: markerStyles
          },
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: markerStyles
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
            }
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var min = 0;

      if (!chartData.quantityDone.length)
      {
        min = null;
      }

      this.chart.yAxis[1].setExtremes(min, null, false);

      var visible = this.model.query.get('interval') !== 'hour';
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);

      this.chart.series[0].update({marker: markerStyles}, false);
      this.chart.series[1].update({marker: markerStyles}, false);
      this.chart.series[2].update({marker: markerStyles, visible: visible}, false);
      this.chart.series[3].update({marker: markerStyles}, false);

      this.chart.series[0].setData(chartData.quantityDone, false);
      this.chart.series[1].setData(chartData.efficiency, false);
      this.chart.series[2].setData(chartData.productivity, false);
      this.chart.series[3].setData(chartData.downtime, true);
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

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
      };
    },

    getTitle: function()
    {
      var orgUnitType = this.model.get('orgUnitType');

      if (!orgUnitType)
      {
        return t('reports', 'report1:overallTitle');
      }

      var orgUnit = this.model.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, false, false);
      }

      return orgUnit.getLabel();
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
