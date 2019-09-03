// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  'app/wmes-fap-entries/templates/reportTable',
  'app/wmes-fap-entries/templates/tableAndChart'
], function(
  _,
  t,
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
      var metric = this.options.metric;
      var series = this.serializeChartSeries();
console.log(metric, series.length, series);
      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0]
        },
        exporting: {
          filename: this.t('report:filenames:' + metric),
          chartOptions: {
            title: {
              text: this.t('report:title:' + metric)
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
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false,
          opposite: true
        },
        tooltip: {
          shared: true,
          valueDecimals: this.options.metric === 'duration' ? 1 : 0,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: series.length
                ? (series.length * series[0].data.length <= (series[0].data.length === 1 ? 40 : 35))
                : false
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
        rows: this.model.get(this.options.metric).rows
      }));
    },

    serializeChartSeries: function()
    {
      var view = this;
      var series = view.model.get(view.options.metric).series;

      return Object.keys(series).map(function(seriesId)
      {
        var serie = series[seriesId];

        return _.defaults(serie, {
          id: seriesId,
          type: 'column',
          name: serie.name || view.t('report:series:' + seriesId),
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
