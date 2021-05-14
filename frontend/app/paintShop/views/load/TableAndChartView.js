// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  'app/paintShop/templates/load/reportTable',
  'app/paintShop/templates/load/tableAndChart'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis,
  renderReportTable,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

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

      this.updateTable();

      this.$el.toggleClass('has-many-series', this.chart.series.length > 10);
    },

    createChart: function()
    {
      const metric = this.options.metric;
      const series = this.serializeChartSeries();
      const xAxis = {};

      if (this.model.get('interval') === 'min')
      {
        xAxis.type = 'category';
        xAxis.categories = this.serializeCategories();
      }
      else
      {
        xAxis.type = 'datetime';
        xAxis.labels = formatXAxis.labels(this);
      }

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0]
        },
        exporting: {
          filename: this.t('load:report:' + metric + ':filename', {
            counter: this.options.counter
          }),
          chartOptions: {
            title: {
              text: this.t('load:report:' + metric + ':title', {
                counter: this.t('load:counters:' + this.options.counter)
              })
            },
            legend: {
              enabled: true
            }
          },
          buttons: {
            contextButton: {
              align: 'left'
            }
          },
          noDataLabels: series.length ? (series.length * series[0].data.length > 30) : false
        },
        title: false,
        noData: {},
        xAxis,
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false,
          opposite: true
        },
        tooltip: {
          shared: true,
          valueDecimals: this.options.metric === 'losses' ? 1 : 0,
          headerFormatter: xAxis.type === 'datetime' ? formatTooltipHeader.bind(this) : undefined,
          valueFormatter: function(point)
          {
            if (point.options.seconds)
            {
              return time.toString(point.options.seconds, false, false);
            }

            return point.y;
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: false
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

    updateTable: function()
    {
      this.$id('table').html(renderReportTable({
        rows: this.model.get(this.options.metric)[this.options.counter].rows
      }));
    },

    serializeCategories: function()
    {
      const rows = this.model.get(this.options.metric)[this.options.counter].rows;
      const categories = [];

      for (let i = 0, l = Math.min(15, rows.length); i < l; ++i)
      {
        const row = rows[i];

        if (row.id !== 'total')
        {
          categories.push(row.label || this.t(`report:series:${row.id}`));
        }
      }

      return categories;
    },

    serializeChartSeries: function()
    {
      const {rows, series} = this.model.get(this.options.metric)[this.options.counter];

      if (this.model.get('interval') === 'min')
      {
        const s = {
          id: this.options.metric,
          type: 'column',
          name: this.t(`load:report:series:${this.options.metric}`),
          data: []
        };

        for (let i = 0, l = Math.min(15, rows.length); i < l; ++i)
        {
          const row = rows[i];

          if (row.id !== 'total')
          {
            s.data.push({
              y: row.abs,
              color: row.color
            });
          }
        }

        return [s];
      }

      return Object.keys(series).map(id =>
      {
        var s = series[id];

        return _.defaults(s, {
          id,
          type: 'column',
          name: s.name || this.t(`report:series:${id}`),
          data: []
        });
      });
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
