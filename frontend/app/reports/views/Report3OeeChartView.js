define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  _,
  $,
  time,
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-3-oeeChart',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:chartSummary', this.render);

      this.onResize = _.debounce(this.onResize.bind(this), 100);

      $(window).resize(this.onResize);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);

      if (this.chart !== null)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    afterRender: function()
    {
      if (this.timers.createOrUpdateChart)
      {
        clearTimeout(this.timers.createOrUpdateChart);
      }

      this.timers.createOrUpdateChart = setTimeout(this.createOrUpdateChart.bind(this), 1);
    },

    createOrUpdateChart: function()
    {
      this.timers.createOrUpdateChart = null;

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
      var formatTooltipHeader = this.formatTooltipHeader.bind(this);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          plotBorderWidth: 1,
          spacing: [0, 0, 0, 0],
          reflow: false,
          resetZoomButton: {
            relativeTo: 'chart',
            position: {
              y: 5
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [
          {
            title: false,
            labels: {
              format: '{value}h'
            },
            min: 0
          },
          {
            title: false,
            opposite: true,
            gridLineWidth: 0,
            labels: {
              format: '{value}%'
            },
            min: 0
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
              var y = point.y.toLocaleString ? point.y.toLocaleString() : point.y;

              str += '<tr><td style="color: ' + point.series.color + '">'
                + point.series.name + ':</td><td>'
                + y + point.series.tooltipOptions.valueSuffix
                + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'top',
          itemWidth: 175,
          margin: 14
        },
        plotOptions: {
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: this.getMarkerStyles(chartData.totalAvailabilityH.length)
          }
        },
        series: [
          {
            name: t('reports', 'oee:totalAvailability'),
            type: 'column',
            yAxis: 0,
            data: chartData.totalAvailabilityH,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:operationalAvailability:h'),
            type: 'column',
            yAxis: 0,
            data: chartData.operationalAvailabilityH,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:exploitation:h'),
            type: 'column',
            yAxis: 0,
            data: chartData.exploitationH,
            tooltip: {
              valueSuffix: 'h'
            }
          },
          {
            name: t('reports', 'oee:oee'),
            type: 'line',
            yAxis: 1,
            data: chartData.oee,
            tooltip: {
              valueSuffix: '%'
            }
          },
          {
            name: t('reports', 'oee:operationalAvailability:%'),
            type: 'line',
            yAxis: 1,
            data: chartData.operationalAvailabilityP,
            tooltip: {
              valueSuffix: '%'
            }
          },
          {
            name: t('reports', 'oee:exploitation:%'),
            type: 'line',
            yAxis: 1,
            data: chartData.exploitationP,
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
      var markerStyles = this.getMarkerStyles(chartData.totalAvailabilityH.length);
      var series = this.chart.series;

      series[3].update({marker: markerStyles}, false);
      series[4].update({marker: markerStyles}, false);
      series[5].update({marker: markerStyles}, false);

      series[0].setData(chartData.totalAvailabilityH, false);
      series[1].setData(chartData.operationalAvailabilityH, false);
      series[2].setData(chartData.exploitationH, false);
      series[3].setData(chartData.oee, false);
      series[4].setData(chartData.operationalAvailabilityP, false);
      series[5].setData(chartData.exploitationP, true);
    },

    serializeChartData: function()
    {
      return this.model.get('chartSummary');
    },

    formatTooltipHeader: function(epoch)
    {
      var timeMoment = time.getMoment(epoch);
      var interval = this.model.query.get('interval') || 'day';

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, {}));
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
    },

    onResize: function()
    {
      if (this.chart)
      {
        this.chart.reflow();
      }
    }

  });
});
