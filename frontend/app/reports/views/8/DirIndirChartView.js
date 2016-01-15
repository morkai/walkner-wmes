// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/data/colorFactory',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
  colorFactory,
  formatTooltipHeader
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
      this.listenTo(this.model.query, 'change:visibleSeries', this.render);
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
      var yAxis = this.serializeYAxis(series);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 450
        },
        exporting: {
          filename: t.bound('reports', '8:filename:dirIndir'),
          chartOptions: {
            title: false
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: yAxis,
        tooltip: {
          shared: true,
          valueDecimals: 2,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: true,
          itemStyle: {
            fontSize: '12px',
            lineHeight: '14px'
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

    serializeYAxis: function(series)
    {
      var chartYAxis = [];
      var usedYAxis = {};
      var availableYAxis = {
        fte: {
          id: 'fte',
          title: false,
          min: 0,
          decimals: 2,
          opposite: false
        },
        pce: {
          id: 'pce',
          title: false,
          min: 0,
          decimals: 0,
          opposite: false
        },
        time: {
          id: 'time',
          title: false,
          min: 0,
          decimals: 2,
          opposite: false
        }
      };

      var i = -1;

      _.forEach(series, function(s)
      {
        if (usedYAxis[s.yAxis] === undefined)
        {
          usedYAxis[s.yAxis] = ++i;
        }
      });

      _.forEach(usedYAxis, function(unused, id)
      {
        chartYAxis.push(availableYAxis[id]);
      });

      if (chartYAxis.length > 1)
      {
        _.forEach(chartYAxis, function(yAxis)
        {
          yAxis.opposite = yAxis.id !== 'fte';
        });
      }

      return chartYAxis;
    },

    serializeSeries: function()
    {
      var report = this.model;
      var data = report.get('groups');
      var chartSeries = [];
      var metrics = {
        totalVolumeProduced: {
          type: 'line',
          yAxis: 'pce',
          zIndex: 3,
          tooltip: {
            valueSuffix: t('reports', 'quantitySuffix')
          }
        },
        averageRoutingTime: {
          type: 'line',
          yAxis: 'time',
          zIndex: 4,
          tooltip: {
            valueSuffix: t('reports', '8:times:unit:' + report.query.get('unit'))
          }
        },
        prodBasedPlanners: null,
        prodQualityInspection: null,
        prodOperators: null,
        prodSetters: null,
        masters: null,
        leaders: null,
        prodMaterialHandling: null,
        kitters: null,
        prodTransport: null,
        cycleCounting: null,
        otherWarehousing: null,
        materialQualityInspection: null,
        maintenance: null
      };

      _.forEach(metrics, function(options, id)
      {
        if (options === null)
        {
          options = {
            type: 'column',
            yAxis: 'fte',
            tooltip: {
              valueSuffix: 'FTE'
            }
          };
        }

        addSeries('plan', _.clone(options), id);
        addSeries('real', _.clone(options), id);
      });

      return chartSeries;

      function addSeries(planReal, options, metricId)
      {
        if (!data)
        {
          return;
        }

        options.data = data[planReal][metricId];

        if (!options.data)
        {
          return;
        }

        options.id = metricId + ':' + planReal;

        if (!report.query.isVisibleSeries(options.id))
        {
          return;
        }

        options.metricLabel = t('reports', '8:dirIndir:' + metricId);
        options.name = options.metricLabel + ' ' + t('reports', '8:suffix:' + planReal);
        options.color = report.getColor('dirIndir', options.id);

        chartSeries.push(options);
      }
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
