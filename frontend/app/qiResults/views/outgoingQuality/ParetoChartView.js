// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/core/View'
], function(
  _,
  Highcharts,
  View
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
      this.listenTo(this.model, 'change:totals', this.render);
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
          height: 400,
          zoomType: undefined
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
        yAxis: [{
          title: false,
          allowDecimals: false,
          labels: {
            format: '{value}%'
          },
          min: 0,
          max: 100
        }, {
          title: false,
          allowDecimals: false,
          labels: {
            format: '{value}%'
          },
          opposite: true,
          min: 0,
          max: 100,
          plotLines: [{
            value: 80,
            color: '#E00',
            width: 1,
            zIndex: 1
          }]
        }],
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: function(ctx)
          {
            return ctx.points[0].point.name;
          },
          valueSuffix: '%'
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              y: 15,
              style: {
                color: '#000',
                fontSize: '14px',
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
        name: view.t('report:oql:' + property),
        data: [],
        color: '#337ab7'
      }, {
        id: 'pareto',
        type: 'line',
        name: view.t('report:oql:pareto'),
        data: [],
        yAxis: 1,
        color: '#f0ad4e'
      }];

      var topCount = view.model.getTopCount();
      var top = _.last(view.model.get('groups')) || {};
      var values = top[property] || [];
      var pareto = 0;

      for (var i = 0; i < topCount; ++i)
      {
        var value = values[i];

        if (!value)
        {
          break;
        }

        var category = value[0];

        if (view.options.resolveTitle)
        {
          category += ': ' + view.options.resolveTitle(category, true);
        }

        pareto += value[1];

        categories.push(category);
        series[0].data.push({
          name: value[0],
          y: value[2]
        });
        series[1].data.push((pareto / top.nokCount) * 100);
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
