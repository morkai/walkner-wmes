define([
  'app/i18n',
  'app/core/View',
  'app/highcharts'
], function(
  t,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-4-quantities',

    initialize: function()
    {
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:quantities', this.render);
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

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t('reports', 'filenames:4:quantities')
        },
        title: {
          text: t('reports', 'operator:quantities:title')
        },
        noData: {},
        xAxis: [{
          type: 'category',
          categories: chartData.lossCategories
        }, {
          type: 'category',
          opposite: true,
          labels: {
            enabled: false
          }
        }],
        yAxis: [{
          title: false,
          min: 0
        }, {
          title: false,
          opposite: true,
          min: 0
        }],
        tooltip: {
          valueSuffix: t('reports', 'quantitySuffix'),
          useHTML: true,
          formatter: function(tooltip)
          {
            var series = tooltip.chart.series;
            var str = '<table>'
              + tooltipRow(series[0].name, series[0].data[0].y, series[0].color)
              + tooltipRow(series[1].name, series[1].data[0].y, series[1].color)
              + tooltipRow(
                  t('reports', 'operator:quantities:total'),
                  series[0].data[0].y + series[1].data[0].y,
                  '#333'
                );

            if (typeof this.key === 'string')
            {
              str += tooltipRow(this.key, this.y, this.series.color);
            }

            str += '</table>';

            return str;
          },
          followPointer: false,
          positioner: function(labelWidth)
          {
            return {
              x: this.chart.chartWidth - labelWidth - this.chart.marginRight - 5,
              y: this.chart.plotTop + 5
            };
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          column: {
            grouping: false,
            dataLabels: {
              enabled: true,
              color: '#000'
            }
          }
        },
        series: [{
          name: t('reports', 'operator:quantities:bad'),
          color: 'rgba(255,0,0,.75)',
          borderWidth: 0,
          type: 'column',
          data: chartData.bad,
          xAxis: 1,
          yAxis: 0,
          stacking: 'normal',
          pointPadding: 0,
          groupPadding: 0
        }, {
          name: t('reports', 'operator:quantities:good'),
          color: 'rgba(102,204,0,.75)',
          borderWidth: 0,
          type: 'column',
          data: chartData.good,
          xAxis: 1,
          yAxis: 0,
          stacking: 'normal',
          pointPadding: 0,
          groupPadding: 0
        }, {
          name: t('reports', 'operator:quantities:loss'),
          color: 'orange',
          borderWidth: 0,
          type: 'column',
          data: chartData.losses,
          xAxis: 0,
          yAxis: 1
        }]
      });

      function tooltipRow(label, value, color)
      {
        return '<tr><td style="color: ' + color + '">'
          + label + ':</td><td>'
          + Highcharts.numberFormat(value, 0) + ' ' + t('reports', 'quantitySuffix')
          + '</td></tr>';
      }
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var series = this.chart.series;

      this.chart.xAxis[0].setCategories(chartData.lossCategories, false);

      series[0].setData(chartData.bad, false);
      series[1].setData(chartData.good, false);
      series[2].setData(chartData.losses, true);
    },

    serializeChartData: function()
    {
      return this.model.get('quantities');
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
