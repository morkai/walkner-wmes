// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/data/colorFactory',
  'app/data/aors',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
  colorFactory,
  aors,
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
      var seriesAndCategories = this.serializeSeriesAndCategories();
      var series = seriesAndCategories.series;
      var categories = seriesAndCategories.categories;
      var yAxis = this.serializeYAxis(series);
      var exporting = {
        filename: t.bound('reports', '8:filename:times'),
        chartOptions: {
          title: false,
          spacing: [0, 0, 0, 0]
        },
        sourceWidth: 1754 * 0.75,
        sourceHeight: 1240 * 0.75
      };

      if (categories.length)
      {
        exporting.chartOptions.title = {
          text: this.serializeSingleChartTitle(),
          style: {
            fontSize: '24px'
          }
        };
        exporting.chartOptions.plotOptions = {
          column: {
            dataLabels: {
              style: {
                fontSize: '14px'
              }
            }
          }
        };
        exporting.chartOptions.xAxis = [{
          type: categories.length ? 'category' : 'datetime',
          categories: categories.length ? categories : undefined,
          labels: {
            style: {
              fontSize: '16px'
            }
          }
        }];
        exporting.sourceWidth = 1754 * 0.75;
        exporting.sourceHeight = 1240 * 0.75;
      }

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 450
        },
        exporting: exporting,
        title: false,
        noData: {},
        xAxis: {
          type: categories.length ? 'category' : 'datetime',
          categories: categories.length ? categories : undefined
        },
        yAxis: yAxis,
        tooltip: {
          shared: true,
          valueDecimals: 2,
          headerFormatter: categories.length ? undefined : formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: !categories.length,
          itemStyle: {
            fontSize: '12px',
            lineHeight: '14px'
          }
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: !!categories.length,
              formatter: function()
              {
                return this.y === 0 ? '' : Highcharts.numberFormat(this.y, 1).replace(/.0$/, '');
              },
              style: {
                color: '#000',
                fontSize: '12px',
                fontWeight: 'normal',
                textShadow: 'none'
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

    serializeYAxis: function(series)
    {
      var chartYAxis = [];
      var usedYAxis = {};
      var availableYAxis = {
        percent: {
          id: 'percent',
          title: false,
          min: 0,
          decimals: 2,
          opposite: false,
          labels: {
            format: '{value}%'
          }
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
          yAxis.opposite = yAxis.id !== 'time';
        });
      }

      return chartYAxis;
    },

    serializeSeriesAndCategories: function()
    {
      var report = this.model;
      var timeUnit = t('reports', '8:times:unit:' + report.query.get('unit'));
      var summary = report.get('summary');
      var data = report.get('groups');
      var single = data && data.plan.totalVolumeProduced.length === 1;
      var usedYAxis = {};
      var chartSeries = [];
      var metrics = {
        timeAvailablePerShift: null,
        routingTimeForLine: null,
        routingTimeForLabour: null,
        heijunkaTimeForLine: null,
        breaks: null,
        fap0: null,
        startup: null,
        shutdown: null,
        meetings: null,
        sixS: null,
        tpm: null,
        trainings: null,
        coTime: null,
        downtime: null,
        plan: {
          type: single ? 'column' : 'line',
          yAxis: 'pce',
          zIndex: 3,
          tooltip: {
            valueSuffix: t('reports', 'quantitySuffix')
          }
        },
        efficiency: {
          type: single ? 'column' : 'line',
          yAxis: 'percent',
          zIndex: 3,
          tooltip: {
            valueSuffix: '%'
          }
        }
      };

      _.forEach(summary ? summary.downtimeByAor : null, function(unused, aorId)
      {
        metrics[aorId] = null;
      });

      _.forEach(metrics, function(options, id)
      {
        if (options === null)
        {
          options = {
            type: 'column',
            yAxis: 'time',
            tooltip: {
              valueSuffix: timeUnit
            }
          };
        }

        var isAor = /^[a-f0-9]{24}$/.test(id);

        if (!isAor)
        {
          addSeries('plan', _.clone(options), id);
        }

        addSeries('real', _.clone(options), id, isAor);
      });

      usedYAxis = Object.keys(usedYAxis);

      if (single && usedYAxis.length && chartSeries.length)
      {
        return this.serializeSingleSeriesAndCategories(chartSeries, usedYAxis[0]);
      }

      return {
        categories: [],
        series: chartSeries
      };

      function addSeries(planReal, options, metricId, isAor)
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

        options.metricId = metricId;
        options.planReal = planReal;
        options.metricLabel = isAor ? aors.get(metricId).getLabel() : t('reports', '8:times:' + metricId);
        options.name = options.metricLabel + ' ' + t('reports', '8:suffix:' + planReal);
        options.color = report.getColor('times', options.id);
        options.groupPadding = single ? 0 : 0.2;

        usedYAxis[options.yAxis] = true;

        chartSeries.push(options);
      }
    },

    serializeSingleSeriesAndCategories: function(chartSeries, yAxis)
    {
      var dataLabelsFormatter = function()
      {
        var y = this.point.realY === null ? this.y : this.point.realY;

        return y == null || y === 0 ? '' : Highcharts.numberFormat(Math.round(y * 100) / 100, -1);
      };
      var tooltip = {
        valueSuffix: function(point) { return point.valueSuffix; },
        valueFormatter: function(point) { return point.realY === null ? point.y : point.realY; }
      };
      var categories = {};
      var series = [{
        id: 'plan',
        type: 'column',
        name: t('reports', '8:column:plan'),
        yAxis: yAxis,
        data: [],
        tooltip: tooltip,
        grouping: false,
        borderWidth: 0,
        groupPadding: 0,
        color: 'rgba(0, 170, 255, 0.5)'
      }, {
        id: 'real',
        type: 'column',
        name: t('reports', '8:column:real'),
        yAxis: yAxis,
        data: [],
        tooltip: tooltip,
        grouping: false,
        borderWidth: 0,
        color: 'rgba(0, 170, 255, 1)'
      }];
      var maxTimeValue = -1;

      _.forEach(chartSeries, function(chartSerie)
      {
        if (!categories[chartSerie.metricId])
        {
          categories[chartSerie.metricId] = {
            label: chartSerie.metricLabel,
            plan: null,
            real: null,
            realPlan: null,
            realReal: null,
            valueSuffix: chartSerie.tooltip.valueSuffix
          };
        }

        var value = chartSerie.data[0].y;

        if (chartSerie.metricId !== 'plan' && chartSerie.metricId !== 'efficiency')
        {
          maxTimeValue = Math.max(maxTimeValue, value);
        }

        categories[chartSerie.metricId][chartSerie.planReal] = value;
      });

      if (maxTimeValue !== -1)
      {
        if (categories.plan)
        {
          this.calculateFakeValues(categories.plan, maxTimeValue);
        }

        if (categories.efficiency)
        {
          this.calculateFakeValues(categories.efficiency, maxTimeValue);
        }
      }

      _.forEach(categories, function(category, metricId)
      {
        var planInside = (Math.round(category.plan * 100) / 100) < (Math.round(category.real * 100) / 100);
        var color;

        if (category.plan !== null)
        {
          if (metricId === 'plan' || metricId === 'efficiency')
          {
            color = planInside ? '#5cb85c' : '#d9534f';
          }
          else
          {
            color = planInside ? '#d9534f' : '#5cb85c';
          }
        }

        series[0].data.push({
          y: category.plan,
          realY: category.realPlan,
          metricId: metricId,
          dataLabels: {
            inside: planInside,
            formatter: dataLabelsFormatter
          },
          valueSuffix: category.valueSuffix
        });
        series[1].data.push({
          y: category.real,
          realY: category.realReal,
          metricId: metricId,
          dataLabels: {
            inside: !planInside,
            style: {
              fontStyle: 'oblique'
            },
            formatter: dataLabelsFormatter
          },
          color: color,
          valueSuffix: category.valueSuffix
        });
      });

      return {
        categories: _.map(categories, function(category) { return category.label; }),
        series: series
      };
    },

    calculateFakeValues: function(category, maxTimeValue)
    {
      var plan = category.plan;
      var real = category.real;
      var hasPlan = plan !== null;
      var hasReal = real !== null;

      if (hasPlan)
      {
        category.realPlan = Math.round(plan);
        category.plan = maxTimeValue;
      }

      if (hasReal)
      {
        category.realReal = Math.round(real);
        category.real = maxTimeValue;
      }

      if (hasPlan && hasReal)
      {
        if (real > plan)
        {
          category.real = maxTimeValue;
          category.plan = maxTimeValue * (category.realPlan / category.realReal);
        }
        else if (plan > real)
        {
          category.plan = maxTimeValue;
          category.real = maxTimeValue * (category.realReal / category.realPlan);
        }
        else
        {
          category.plan = maxTimeValue;
          category.real = maxTimeValue;
        }
      }
    },

    serializeSingleChartTitle: function()
    {
      var report = this.model;
      var query = report.query;
      var shifts = query.get('shifts');
      var divisions = query.get('divisions');
      var subdivisionTypes = query.get('subdivisionTypes');
      var prodLines = query.get('prodLines');
      var totalVolumeProduced = report.get('groups').plan.totalVolumeProduced;
      var title = [];

      if (prodLines.length)
      {
        title.push(t('reports', '8:title:line' + (prodLines.length === 1 ? '' : 's'), {
          line: prodLines.join(', ')
        }));
      }
      else if (query.hasAllDivisionsSelected())
      {
        if (subdivisionTypes.length === 1)
        {
          title.push(t('reports', 'filter:subdivisionType:' + subdivisionTypes[0]));
        }
        else
        {
          title.push(t('reports', 'charts:title:overall'));
        }
      }
      else
      {
        title.push(divisions.join(', '));

        if (subdivisionTypes.length === 1)
        {
          title.push(t('reports', 'filter:subdivisionType:' + subdivisionTypes[0]));
        }
      }

      if (totalVolumeProduced.length)
      {
        title.push(formatTooltipHeader.call(this, totalVolumeProduced[0].x));
      }

      title.push(t('reports', '8:title:shift:' + (shifts.length || 3), {
        s1: t('core', 'SHIFT:' + shifts[0]),
        s2: t('core', 'SHIFT:' + shifts[1]),
        s3: t('core', 'SHIFT:' + shifts[2])
      }));

      return title.join(' - ');
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
