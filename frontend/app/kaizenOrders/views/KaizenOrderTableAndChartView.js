// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  '../dictionaries',
  'app/kaizenOrders/templates/reportTable',
  'app/kaizenOrders/templates/tableAndChart'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
  kaizenDictionaries,
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
    },

    createChart: function()
    {
      var metric = this.options.metric;
      var series = this.serializeChartSeries();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0]
        },
        exporting: {
          filename: t.bound('kaizenOrders', 'report:filenames:' + metric),
          chartOptions: {
            title: {
              text: t.bound('kaizenOrders', 'report:title:' + metric)
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
          noDataLabels: series.length * series[0].data.length > 30
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: false,
          min: 0,
          valueDecimals: 0,
          opposite: true
        },
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            borderWidth: 0
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

    serializeChartData: function()
    {
      return this.model.get(this.options.metric).series;
    },

    serializeChartSeries: function()
    {
      var series = this.model.get(this.options.metric).series;

      return Object.keys(series).map(function(seriesId)
      {
        var serie = series[seriesId];

        return _.defaults(serie, {
          id: seriesId,
          type: 'column',
          name: serie.name || t.bound('kaizenOrders', 'report:series:' + seriesId),
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
