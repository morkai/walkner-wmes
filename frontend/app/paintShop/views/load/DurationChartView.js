// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  time,
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
      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 400
        },
        exporting: {
          filename: this.t('load:report:duration:filename', {counter: this.options.counter}),
          chartOptions: {
            title: {
              text: this.t('load:report:duration:title', {
                counter: this.t('load:counters:' + this.options.counter)
              })
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: [
          {
            title: false,
            min: 0,
            allowDecimals: false,
            labels: {format: '{value}s'}
          },
          {
            title: false,
            min: 0,
            allowDecimals: false,
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: true
        },
        series: this.serializeSeries()
      });
    },

    serializeSeries: function()
    {
      var data = this.serializeChartData();

      if (this.model.get('interval') === 'none')
      {
        return [{
          id: 'actual',
          name: this.t('load:report:duration:actual'),
          data: data.actual,
          type: 'column',
          color: '#0af',
          yAxis: 0,
          tooltip: {
            valueSuffix: 's'
          },
          turboThreshold: 1501
        }];
      }

      return [{
        id: 'avg',
        name: this.t('load:report:duration:avg'),
        data: data.avg,
        type: 'column',
        color: '#0af',
        yAxis: 0,
        tooltip: {
          valueSuffix: 's'
        },
        turboThreshold: 1501
      }, {
        id: 'count',
        name: this.t('load:report:duration:count'),
        data: data.count,
        type: 'line',
        color: '#000',
        yAxis: 1,
        tooltip: {
          valueSuffix: this.t('reports', 'quantitySuffix')
        },
        marker: {
          radius: 0,
          states: {
            hover: {
              radius: 4
            }
          }
        },
        turboThreshold: 1501
      }];
    },

    serializeChartData: function()
    {
      var view = this;
      var counter = view.options.counter;
      var data = {
        actual: [],
        avg: [],
        count: []
      };

      if (view.model.get('interval') === 'none')
      {
        data.actual = view.model.get('load')[counter].map(function(d)
        {
          return {
            x: d[0],
            y: d[1],
            color: view.settings.getLoadStatus(d[1]).color
          };
        });
      }
      else
      {
        view.model.get('groups').forEach(function(g)
        {
          var c = g.counters[counter];

          data.avg.push({
            x: g.key,
            y: c.avg,
            color: view.settings.getLoadStatus(c.avg).color
          });
          data.count.push([g.key, c.count]);
        });
      }

      return data;
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
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
