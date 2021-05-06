// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/core/View',
  'app/data/colorFactory',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  '../../EngagementReport'
], function(
  _,
  Highcharts,
  View,
  colorFactory,
  formatTooltipHeader,
  formatXAxis,
  EngagementReport
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
      const xAxis = this.serializeXAxis();
      const series = this.serializeChartSeries();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 1]
        },
        exporting: {
          filename: this.t(`engagement:export:filename:${this.options.totals}`),
          chartOptions: {
            title: {
              text: this.t(`engagement:title:${this.options.totals}`)
            },
            legend: {
              enabled: true
            }
          },
          noDataLabels: series.length && series.length * series[0].data.length > 30
        },
        title: false,
        noData: {},
        xAxis,
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: xAxis.type === 'datetime' ? formatTooltipHeader.bind(this) : undefined
        },
        legend: {
          enabled: xAxis.type === 'datetime'
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: series.length && series.length * series[0].data.length <= 70
            }
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

    serializeXAxis: function()
    {
      if (this.model.get('groups').length === 1)
      {
        return {
          type: 'category',
          categories: EngagementReport.COUNTERS
            .filter(m => m !== 'total')
            .map(m => this.t(`engagement:series:${m}`))
        };
      }

      return {
        type: 'datetime',
        labels: formatXAxis.labels(this)
      };
    },

    serializeChartSeries: function()
    {
      const series = [];
      const groups = this.model.get('groups');
      const users = this.options.totals === 'users';

      if (groups.length === 1)
      {
        series.push({
          type: 'column',
          name: this.t(`engagement:series:${this.options.totals}`),
          data: EngagementReport.COUNTERS
            .filter(metric => metric !== 'total')
            .map(metric => ({
              color: colorFactory.getColor('suggestions/engagement', metric),
              y: users ? groups[0].totals.users[metric] : groups[0].totals[metric]
            }))
        });

        return series;
      }

      EngagementReport.COUNTERS.forEach(metric =>
      {
        if (metric === 'total')
        {
          return;
        }

        const s = {
          id: metric,
          name: this.t(`engagement:series:${metric}`),
          type: 'column',
          color: colorFactory.getColor('suggestions/engagement', metric),
          data: groups.map(g =>
          {
            return {
              x: g.key,
              y: users ? g.totals.users[metric] : g.totals[metric]
            };
          })
        };

        series.push(s);
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
