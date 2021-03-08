// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  'app/wmes-osh-reports/templates/metrics/riskyObsTable',
  'app/wmes-osh-reports/templates/metrics/tableAndChart'
], function(
  _,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis,
  tableTemplate,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, `change:riskyObs`, this.render);
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
      const series = this.serializeChartSeries();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 1]
        },
        exporting: {
          filename: this.options.filename,
          chartOptions: {
            title: {
              text: this.options.title
            },
            legend: {
              enabled: true
            }
          },
          noDataLabels: false
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(this)
        },
        yAxis: [{
          title: false,
          min: 0,
          allowDecimals: true,
          opposite: false,
          labels: {
            format: '{value}%'
          }
        }],
        tooltip: {
          shared: true,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          column: {
            borderWidth: 0
          }
        },
        series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    updateTable: function()
    {
      const riskyObs = this.model.get('riskyObs') || {series: {}};

      this.$id('table').html(this.renderPartialHtml(tableTemplate, {
        months: (riskyObs.months || []).map(value => formatXAxis(this, {value})),
        cards: riskyObs.cards || [],
        behaviors: riskyObs.behaviors || [],
        workConditions: riskyObs.workConditions || [],
        risky: riskyObs.risky || [],
        min: riskyObs.series.min ? riskyObs.series.min.data : [],
        max: riskyObs.series.max ? riskyObs.series.max.data : [],
        itm: riskyObs.series.itm ? riskyObs.series.itm.data : []
      }));
    },

    serializeChartSeries: function()
    {
      return Object.values((this.model.get('riskyObs') || {series: {}}).series);
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
