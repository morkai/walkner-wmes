// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  '../dictionaries'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
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
      this.listenTo(this.model, 'change:division', this.render);
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
          height: 350
        },
        exporting: {
          filename: t('qiResults', 'report:filenames:nokRatio:division'),
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        },
        title: {
          text: t('qiResults', 'report:title:nokRatio:division')
        },
        noData: {},
        xAxis: {
          type: 'datetime'
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
          valueSuffix: '%',
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
      var nokRatioRef = qiDictionaries.settings.getNokRatioRef();
      var nokRatioData = [];
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
      var min = nokRatioRef > 0 ? nokRatioRef : 100;

      _.forEach(this.model.get('division'), function(group)
      {
        _.forEach(divisions, function(division, i)
        {
          var divisionData = group[division._id] || {
            qtyNok: 0,
            qtyNokInspected: 0,
            ratio: 0
          };
          var y = divisionData.ratio;

          series[i].data.push({
            x: group.key,
            y: y
          });

          if (y < min)
          {
            min = y;
          }
        });

        nokRatioData.push({
          x: group.key,
          y: nokRatioRef
        });
      });

      if (nokRatioRef > 0)
      {
        series.push({
          id: 'ref',
          type: 'line',
          name: t.bound('qiResults', 'report:series:okRatioRef'),
          data: nokRatioData,
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
