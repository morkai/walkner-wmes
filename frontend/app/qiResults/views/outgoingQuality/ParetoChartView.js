// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:groups', this.render);
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
      var chartData = view.serializeChartData();

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 400
        },
        exporting: {
          filename: view.t('report:oql:filename:' + view.options.property),
          chartOptions: {
            title: {
              text: view.t('report:oql:title:' + view.options.property)
            },
            legend: {
              enabled: false
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          categories: chartData.categories,
          showEmpty: false
        },
        yAxis: {
          title: false,
          allowDecimals: false,
          labels: {
            format: '{value}%'
          }
        },
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(view),
          valueSuffix: '%'
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
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
        series: chartData.series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    serializeChartData: function()
    {
      var view = this;
      var property = view.options.property;
      var categories = [];
      var series = [{
        id: 'value',
        type: 'column',
        name: this.t('report:oql:' + property),
        data: []
      }];

      var totals = view.model.get(property) || [];
      var maxRows = view.options.maxRows || 3;

      for (var i = 0; i < maxRows; ++i)
      {
        var total = totals[i];

        if (!total)
        {
          break;
        }

        var category = total[0];

        if (view.options.resolveTitle)
        {
          category += ': ' + view.options.resolveTitle(category, true);
        }

        categories.push(category);
        series[0].data.push(total[2]);
      }

      return {
        categories: categories,
        series: series
      };
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
