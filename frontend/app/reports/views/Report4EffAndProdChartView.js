define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  $,
  time,
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-4-effAndProd',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:effAndProd', this.render);
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
      var series = [{
        name: t('reports', 'operator:productivity'),
        color: '#ffaa00',
        type: 'line',
        data: chartData.productivity
      }, {
        name: t('reports', 'operator:efficiency'),
        color: '#00ee00',
        type: 'line',
        data: chartData.efficiency
      }];

      Object.keys(chartData.byDivision).forEach(function(division)
      {
        series.push({
          name: t('reports', 'operator:efficiency:byDivision', {division: division}),
          type: 'line',
          data: chartData.byDivision[division],
          id: 'division-' + division,
          visible: false
        });
      });

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          plotBorderWidth: 1,
          resetZoomButton: {
            relativeTo: 'chart',
            position: {
              y: 5
            }
          }
        },
        title: {
          text: t('reports', 'operator:effAndProd:title')
        },
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: false,
          labels: {
            format: '{value}%'
          },
          min: 0
        },
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
          },
          valueSuffix: '%'
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 4
              }
            },
            marker: this.getMarkerStyles(chartData.efficiency.length)
          }
        },
        series: series
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData.efficiency.length);
      var chart = this.chart;
      var series = chart.series;

      series.forEach(function(series)
      {
        series.update({marker: markerStyles}, false);
      });

      Object.keys(chartData.byDivision).forEach(function(division)
      {
        var series = chart.get('division-' + division);

        if (series)
        {
          series.setData(chartData.byDivision[division], false);
        }
      });

      series[0].setData(chartData.productivity, false);
      series[1].setData(chartData.efficiency, true);
    },

    serializeChartData: function()
    {
      return this.model.get('effAndProd');
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
        symbol: 'circle',
        radius: dataLength > 1 ? 0 : 4,
        states: {
          hover: {
            radius: dataLength > 1 ? 4 : 8
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
    }

  });
});
