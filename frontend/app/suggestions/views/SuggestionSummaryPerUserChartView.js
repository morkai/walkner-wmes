// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View'
], function(
  _,
  t,
  Highcharts,
  View
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;
      this.limit = -1;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.metric, this.render);
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
      var series = this.serializeSeries();
      var dataPointCount = series[0].data.length;
      var nlsDomain = this.model.getNlsDomain();
      var metric = this.options.metric;
      var height = this.limit === -1
        ? Math.max(400, 150 + 20 * dataPointCount)
        : 100 + 20 * dataPointCount;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: height,
          type: 'bar'
        },
        exporting: {
          filename: t.bound(nlsDomain, 'report:filenames:summary:' + metric),
          chartOptions: {
            title: {
              text: t.bound(nlsDomain, 'report:title:summary:' + metric)
            }
          },
          sourceHeight: height
        },
        title: false,
        noData: {},
        xAxis: {
          categories: this.serializeCategories()
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        legend: {
          enabled: this.limit === -1
        },
        plotOptions: {
          bar: {
            stacking: 'normal',
            dataLabels: {
              enabled: this.limit !== -1,
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

    serializeCategories: function()
    {
      var categories = this.model.get(this.options.metric).categories;

      if (this.limit !== -1)
      {
        categories = categories.slice(0, this.limit);
      }

      return categories;
    },

    serializeSeries: function()
    {
      var data = this.model.get(this.options.metric);

      if (this.limit !== -1)
      {
        data = {
          cancelled: data.cancelled.slice(0, this.limit),
          open: data.open.slice(0, this.limit),
          finished: data.finished.slice(0, this.limit)
        };
      }

      return [{
        id: 'cancelled',
        name: t.bound('suggestions', 'report:series:summary:cancelled'),
        data: data.cancelled,
        color: '#d9534f'
      }, {
        id: 'open',
        name: t.bound('suggestions', 'report:series:summary:open'),
        data: data.open,
        color: '#f0ad4e'
      }, {
        id: 'finished',
        name: t.bound('suggestions', 'report:series:summary:finished'),
        data: data.finished,
        color: '#5cb85c'
      }];
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
