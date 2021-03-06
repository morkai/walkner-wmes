// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  '../dictionaries'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis,
  qiDictionaries
) {
  'use strict';

  return View.extend({

    interval: 'month',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:total', this.render);
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
      if (this.timers.createOrUpdate)
      {
        clearTimeout(this.timers.createOrUpdate);
      }

      this.timers.createOrUpdate = setTimeout(this.createOrUpdate.bind(this), 1);
    },

    createOrUpdate: function()
    {
      this.timers.createOrUpdate = null;

      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
      }
    },

    createChart: function()
    {
      var view = this;
      var series = view.serializeChartSeries();

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 350
        },
        exporting: {
          filename: t('qiResults', 'report:filenames:nokRatio:total'),
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        },
        title: {
          text: t('qiResults', 'report:title:nokRatio:total')
        },
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: {
          title: false,
          allowDecimals: true,
          min: series.min < 10 ? 0 : (series.min - 1),
          max: 100
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
          valueSuffix: '%',
          headerFormatter: formatTooltipHeader.bind(view),
          extraRowsProvider: function(points, rows)
          {
            var options = points[0].point.options;

            rows.push({
              color: '#000000',
              decimals: 0,
              name: t('qiResults', 'report:series:qtyNok'),
              value: options.qtyNok
            }, {
              color: '#000000',
              decimals: 0,
              name: t('qiResults', 'report:series:qtyNokInspected'),
              value: options.qtyNokInspected
            }, {
              color: '#000000',
              decimals: 0,
              name: t('qiResults', 'report:series:qtyInspected'),
              value: options.qtyInspected
            });
          }
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: false,
              style: {
                color: '#000',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 6px #fff, 0 0 3px #fff'
              },
              formatter: function()
              {
                return this.y || '';
              }
            }
          }
        },
        series: series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    serializeChartSeries: function()
    {
      var nokRatioRef = qiDictionaries.settings.getNokRatioRef();
      var nokRatioData = [];
      var series = [{
        id: 'total',
        type: 'column',
        name: t('qiResults', 'report:series:nokRatio'),
        data: [],
        color: '#ffd580'
      }];
      var min = nokRatioRef > 0 ? nokRatioRef : 100;

      _.forEach(this.model.get('total'), function(group)
      {
        var y = group.ratioInspected;

        series[0].data.push({
          x: group.key,
          y: y,
          qtyNok: group.qtyNok,
          qtyNokInspected: group.qtyNokInspected,
          qtyInspected: group.qtyInspected
        });

        if (y < min)
        {
          min = y;
        }

        nokRatioData.push({
          x: group.key,
          y: nokRatioRef
        });
      });

      if (nokRatioRef > 0)
      {
        series.push({
          id: 'ref',
          type: 'line',
          name: t.bound('qiResults', 'report:series:nokRatioRef'),
          data: nokRatioData,
          color: '#5cb85c'
        });
      }

      series.min = min;

      return series;
    },

    onModelLoading: function()
    {
      this.isLoading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    }

  });
});
