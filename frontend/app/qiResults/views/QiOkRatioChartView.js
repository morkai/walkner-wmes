// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis',
  '../dictionaries'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
  formatXAxis,
  qiDictionaries
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
          filename: t('qiResults', 'report:filenames:okRatio'),
          chartOptions: {
            title: {
              text: t('qiResults', 'report:title:okRatio')
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
          allowDecimals: true,
          min: series.min < 10 ? 0 : (series.min - 1),
          max: 100
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
          headerFormatter: formatTooltipHeader.bind(view)
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: false,
              style: {
                color: '#000',
                fontSize: '12px',
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
      var divisions = this.model.get('divisions')
        .filter(function(d) { return d.type === 'prod'; })
        .sort(function(a, b) { return a._id.localeCompare(b._id); });
      var factoryLayoutSettings = this.factoryLayoutSettings;
      var okRatioRef = qiDictionaries.settings.getOkRatioRef();
      var okRatioData = [];
      var series = _.map(divisions, function(division)
      {
        return {
          id: division._id,
          type: 'column',
          name: division._id,
          data: [],
          color: factoryLayoutSettings.getColor(division._id)
        };
      });
      var min = okRatioRef > 0 ? okRatioRef : 100;

      series.push({
        id: 'wh',
        type: 'column',
        name: t('qiResults', 'report:series:wh'),
        data: [],
        color: '#ffd580'
      });

      _.forEach(this.model.get('groups'), function(group)
      {
        _.forEach(divisions, function(division, i)
        {
          var y = group[division._id].ratio;

          series[i].data.push({
            x: group.key,
            y: y
          });

          if (y < min)
          {
            min = y;
          }
        });

        var y = group.wh.ratio === 0 && group.wh.all === 0 ? 100 : group.wh.ratio;

        series[divisions.length].data.push({
          x: group.key,
          y: y
        });

        if (y < min)
        {
          min = y;
        }

        okRatioData.push({
          x: group.key,
          y: okRatioRef
        });
      });

      if (okRatioRef > 0)
      {
        series.push({
          id: 'ref',
          type: 'column',
          name: t.bound('qiResults', 'report:series:okRatioRef'),
          data: okRatioData,
          color: '#5cb85c'
        });
      }

      series.min = min;

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
