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
      var series = view.serializeChartSeries();

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 400
        },
        exporting: {
          filename: view.t('report:oql:filename:ppm'),
          chartOptions: {
            title: {
              text: view.t('report:oql:title:ppm')
            },
            legend: {
              enabled: false
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: {
          title: false,
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(view)
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
      var series = [{
        id: 'oql',
        type: 'column',
        name: this.t('report:oql:series:oql'),
        data: [],
        color: '#5cb85c'
      }, {
        id: 'target',
        type: 'line',
        name: this.t('report:oql:series:oqlTarget'),
        data: [],
        color: '#ffd580'
      }];

      _.forEach(this.model.get('groups'), function(group)
      {
        series[0].data.push({
          x: group.key,
          y: group.oql,
          color: group.oqlTarget && group.oql > group.oqlTarget ? '#d9534f' : '#5cb85c'
        });

        series[1].data.push({
          x: group.key,
          y: group.oqlTarget
        });
      });

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
