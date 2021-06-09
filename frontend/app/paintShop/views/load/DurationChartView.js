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
      this.invisibleSeries = [];

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:groups change:load', _.debounce(this.render.bind(this), 1));
      this.listenTo(this.model, 'legendToggled', this.onLegendToggled);
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
          headerFormatter: formatTooltipHeader.bind(this),
          extraRowsProvider: (points, rows) =>
          {
            var avg = rows.find(row => row.point.series.userOptions.id === 'avg');
            var count = rows.find(row => row.point.series.userOptions.id === 'count');

            rows = [];

            if (avg)
            {
              rows.push(avg, {
                point: null,
                color: 'transparent',
                name: this.t('load:report:duration:min'),
                suffix: 's',
                decimals: 0,
                value: avg.point.data.min
              }, {
                point: null,
                color: 'transparent',
                name: this.t('load:report:duration:max'),
                suffix: 's',
                decimals: 0,
                value: avg.point.data.max
              });
            }

            if (count)
            {
              rows.push(count);
            }

            return rows;
          }
        },
        legend: {
          enabled: true
        },
        series: this.serializeSeries(),
        plotOptions: {
          series: {
            events: {
              legendItemClick: function()
              {
                view.model.trigger('legendToggled', this.userOptions.id, !this.visible);

                return false;
              }
            }
          }
        }
      });
    },

    serializeSeries: function()
    {
      var data = this.serializeChartData();

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
        turboThreshold: 1501,
        visible: !this.invisibleSeries.includes('avg')
      }, {
        id: 'count',
        name: this.t('load:report:duration:count'),
        data: data.count,
        type: 'line',
        color: '#000',
        lineWidth: data.count.length > 30 ? 1 : 2,
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
        turboThreshold: 1501,
        visible: !this.invisibleSeries.includes('count')
      }];
    },

    serializeChartData: function()
    {
      var view = this;
      var counter = view.options.counter;
      var data = {
        avg: [],
        count: []
      };

      if (view.model.get('interval') === 'min')
      {
        view.model.get('load')[counter].forEach(function(d)
        {
          data.avg.push({
            x: d.key,
            y: d.avg,
            color: view.settings.getLoadStatus(counter, d.avg).color,
            data: d
          });
          data.count.push([d.key, d.count]);
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
            color: view.settings.getLoadStatus(counter, c.avg).color,
            data: c
          });
          data.count.push([g.key, c.count]);
        });
      }

      return data;
    },

    updateChart: function()
    {
      this.invisibleSeries = this.chart.series.filter(s => !s.visible).map(s => s.userOptions.id);

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
    },

    onLegendToggled: function(seriesId, visible)
    {
      console.log(seriesId, visible);
      if (!this.chart)
      {
        return;
      }

      var series = this.chart.series.find(s => s.userOptions.id === seriesId);

      if (!series)
      {
        return;
      }

      if (series.visible === visible)
      {
        return;
      }

      if (visible)
      {
        series.show();
      }
      else
      {
        series.hide();
      }
    }

  });
});
