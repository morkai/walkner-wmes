// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/orgUnits'
], function(
  _,
  time,
  t,
  Highcharts,
  View,
  orgUnits
) {
  'use strict';

  var COLOR_QUANTITY_DONE = '#0af';
  var COLOR_EFFICIENCY = '#0e0';
  var COLOR_PRODUCTIVITY = '#fa0';
  var COLOR_PRODUCTIVITY_NO_WH = '#e60';
  var COLOR_DOWNTIME = 'rgba(255,0,0,.75)';

  return View.extend({

    className: 'reports-chart reports-drillingChart reports-1-coeffs',

    initialize: function()
    {
      this.idPrefix = _.uniqueId('v');
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:coeffs', this.render);

      if (this.metricRefs)
      {
        this.listenTo(this.metricRefs, 'add', this.onMetricRefUpdate);
        this.listenTo(this.metricRefs, 'change', this.onMetricRefUpdate);
      }

      if (this.displayOptions)
      {
        this.listenTo(
          this.displayOptions,
          'change:series change:maxQuantityDone change:maxPercentCoeff',
          _.debounce(this.onDisplayOptionsChange, 1)
        );
        this.listenTo(this.displayOptions, 'change:references', this.onDisplayReferencesChange);
      }
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
      if (this.chart)
      {
        this.updateChart();
      }
      else if (this.shouldRenderChart)
      {
        this.createChart();

        if (this.loading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var min = 0;

      if (!chartData.quantityDone.length)
      {
        min = null;
      }

      var visible = this.model.query.get('interval') !== 'hour';
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var series = this.chart.series;

      this.updateExtremes(false);

      series[0].update({marker: markerStyles}, false);
      series[1].update({marker: markerStyles}, false);
      series[2].update({marker: markerStyles, visible: visible && this.isSeriesVisible('productivity')}, false);
      series[3].update({marker: markerStyles, visible: visible && this.isSeriesVisible('productivityNoWh')}, false);
      series[4].update({marker: markerStyles}, false);
      series[5].update({marker: markerStyles}, false);

      series[0].setData(chartData.quantityDone, false);
      series[1].setData(chartData.efficiency, false);
      series[2].setData(chartData.productivity, false);
      series[3].setData(chartData.productivityNoWh, false);
      series[4].setData(chartData.scheduledDowntime, false);
      series[5].setData(chartData.unscheduledDowntime, true);

      this.updatePlotLines();
    },

    updatePlotLines: function()
    {
      if (!this.metricRefs)
      {
        return;
      }

      this.updatePlotLine('efficiency');
      this.updatePlotLine('productivity');
      this.updatePlotLine('productivityNoWh');
    },

    updatePlotLine: function(metric)
    {
      if (!this.chart)
      {
        return;
      }

      var series = this.chart.get(metric);

      if (!series)
      {
        return;
      }

      series.yAxis.removePlotLine(metric);

      if (!series.visible || !this.isReferenceVisible(metric))
      {
        return;
      }

      var metricRef = this.getMetricRef(metric);

      if (!metricRef)
      {
        return;
      }

      series.yAxis.addPlotLine({
        id: metric,
        color: series.color,
        dashStyle: 'dash',
        value: metricRef,
        width: 2,
        zIndex: 4
      });
    },

    updateExtremes: function(redraw)
    {
      /*jshint eqnull:true*/

      if (this.displayOptions)
      {
        var useMax = !this.model.get('isParent') || this.model.get('extremes') === 'parent';
        var maxQuantityDone = useMax ? this.displayOptions.get('maxQuantityDone') : null;
        var maxPercentCoeff = useMax ? this.displayOptions.get('maxPercentCoeff') : null;

        this.chart.yAxis[0].setExtremes(maxQuantityDone == null ? null : 0, maxQuantityDone, false, false);
        this.chart.yAxis[1].setExtremes(maxPercentCoeff == null ? null : 0, maxPercentCoeff, redraw, false);
      }
    },

    getMetricRef: function(metric)
    {
      return this.metricRefs.getValue(metric, this.getMetricRefOrgUnitId());
    },

    getMetricRefOrgUnitId: function()
    {
      var orgUnitType = this.model.get('orgUnitType');
      var orgUnit = this.model.get('orgUnit');
      var subdivisionType = this.model.query.get('subdivisionType');

      if (orgUnitType === null)
      {
        return 'overall' + (subdivisionType ? ('.' + subdivisionType) : '');
      }

      if (orgUnitType === 'division')
      {
        return this.getMetricRefOrgUnitIdByDivision(subdivisionType, orgUnit);
      }

      if (orgUnitType === 'subdivision')
      {
        return orgUnit.id;
      }

      var subdivision = orgUnits.getSubdivisionFor(orgUnit);

      return subdivision ? subdivision.id : null;
    },

    getMetricRefOrgUnitIdByDivision: function(subdivisionType, orgUnit)
    {
      if (subdivisionType === null)
      {
        return orgUnit.id;
      }

      // TODO: Change prod to assembly EVERYWHERE
      if (subdivisionType === 'prod')
      {
        subdivisionType = 'assembly';
      }

      var subdivisions = orgUnits.getChildren(orgUnit).filter(function(subdivision)
      {
        return subdivision.get('type') === subdivisionType;
      });

      return subdivisions.length ? subdivisions[0].id : null;
    },

    serializeChartData: function()
    {
      return this.model.get('coeffs');
    },

    isSeriesVisible: function(series)
    {
      return !this.displayOptions || this.displayOptions.isSeriesVisible(series);
    },

    isReferenceVisible: function(reference)
    {
      return !this.displayOptions || this.displayOptions.isReferenceVisible(reference);
    },

    formatTooltipHeader: function(epoch)
    {
      /*jshint -W015*/

      var timeMoment = time.getMoment(epoch);
      var interval = this.model.query.get('interval') || 'hour';
      var data;

      if (interval === 'shift')
      {
        data = {
          shift: t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
        };
      }

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, data));
    },

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
      };
    },

    onModelLoading: function()
    {
      this.loading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.loading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onMetricRefUpdate: function(metricRef)
    {
      var metricInfo = this.metricRefs.parseSettingId(metricRef.id);

      if (metricInfo.orgUnit === this.getMetricRefOrgUnitId())
      {
        this.updatePlotLine(metricInfo.metric);
      }
    },

    onDisplayOptionsChange: function()
    {
      var visibleSeries = this.displayOptions.get('series');

      this.chart.series.forEach(function(series)
      {
        var visible = !!visibleSeries[series.options.id];

        if (series.visible !== visible)
        {
          series.setVisible(visible, false);
        }
      });

      this.updateExtremes(true);
    },

    onDisplayReferencesChange: function(model, changes)
    {
      var metrics = Object.keys(changes);

      if (!metrics.length)
      {
        return this.updatePlotLines();
      }

      for (var i = 0, l = metrics.length; i < l; ++i)
      {
        if (this.chart.get(metrics[i]))
        {
          this.updatePlotLines();

          break;
        }
      }
    },

    createChart: function()
    {
      var chartData = this.serializeChartData();
      var formatTooltipHeader = this.formatTooltipHeader.bind(this);
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var view = this;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null,
          events: {
            selection: function(e)
            {
              if (e.resetSelection)
              {
                view.timers.resetExtremes = setTimeout(
                  this.yAxis[1].setExtremes.bind(this.yAxis[1], 0, null, true, false), 1
                );
              }
            }
          }
        },
        exporting: {
          filename: t('reports', 'filenames:1:coeffs')
        },
        title: {
          useHTML: true,
          text: this.model.getOrgUnitTitle()
        },
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [
          {
            title: false
          },
          {
            title: false,
            opposite: true,
            labels: {
              format: '{value}%'
            }
          }
        ],
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function()
          {
            var str = '<b>' + formatTooltipHeader(this.x) +'</b><table>';

            this.points.forEach(function(point)
            {
              str += '<tr><td style="color: ' + point.series.color + '">'
                + point.series.name + ':</td><td>'
                + point.y + point.series.tooltipOptions.valueSuffix
                + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          area: {
            lineWidth: 0,
            marker: markerStyles
          },
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: markerStyles
          }
        },
        series: [
          {
            id: 'quantityDone',
            name: t.bound('reports', 'coeffs:quantityDone'),
            color: COLOR_QUANTITY_DONE,
            type: 'area',
            yAxis: 0,
            data: chartData.quantityDone,
            tooltip: {
              valueSuffix: t('reports', 'quantitySuffix')
            },
            visible: this.isSeriesVisible('quantityDone'),
            zIndex: 1
          },
          {
            id: 'efficiency',
            name: t.bound('reports', 'coeffs:efficiency'),
            color: COLOR_EFFICIENCY,
            type: 'line',
            yAxis: 1,
            data: chartData.efficiency,
            tooltip: {
              valueSuffix: '%'
            },
            events: {
              show: this.updatePlotLine.bind(this, 'efficiency'),
              hide: this.updatePlotLine.bind(this, 'efficiency')
            },
            visible: this.isSeriesVisible('efficiency'),
            zIndex: 2
          },
          {
            id: 'productivity',
            name: t.bound('reports', 'coeffs:productivity'),
            color: COLOR_PRODUCTIVITY,
            type: 'line',
            yAxis: 1,
            data: chartData.productivity,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour' && this.isSeriesVisible('productivity'),
            events: {
              show: this.updatePlotLine.bind(this, 'productivity'),
              hide: this.updatePlotLine.bind(this, 'productivity')
            },
            zIndex: 3
          },
          {
            id: 'productivityNoWh',
            name: t.bound('reports', 'coeffs:productivityNoWh'),
            color: COLOR_PRODUCTIVITY_NO_WH,
            type: 'line',
            yAxis: 1,
            data: chartData.productivityNoWh,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour' && this.isSeriesVisible('productivityNoWh'),
            events: {
              show: this.updatePlotLine.bind(this, 'productivityNoWh'),
              hide: this.updatePlotLine.bind(this, 'productivityNoWh')
            },
            zIndex: 4
          },
          {
            id: 'scheduledDowntime',
            name: t.bound('reports', 'coeffs:scheduledDowntime'),
            color: COLOR_DOWNTIME,
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.scheduledDowntime,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.isSeriesVisible('scheduledDowntime'),
            zIndex: 5
          },
          {
            id: 'unscheduledDowntime',
            name: t.bound('reports', 'coeffs:unscheduledDowntime'),
            color: COLOR_DOWNTIME,
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.unscheduledDowntime,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.isSeriesVisible('unscheduledDowntime'),
            zIndex: 6
          }
        ]
      });
    }

  });
});
