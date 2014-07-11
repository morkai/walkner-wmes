// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/orgUnits'
], function(
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

    className: function()
    {
      return 'reports-chart reports-drillingChart reports-1-coeffs';
    },

    initialize: function()
    {
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
            gridLineWidth: 0,
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
            name: t('reports', 'coeffs:quantityDone'),
            color: COLOR_QUANTITY_DONE,
            type: 'area',
            yAxis: 0,
            data: chartData.quantityDone,
            tooltip: {
              valueSuffix: t('reports', 'quantitySuffix')
            }
          },
          {
            id: 'efficiency',
            name: t('reports', 'coeffs:efficiency'),
            color: COLOR_EFFICIENCY,
            type: 'line',
            yAxis: 1,
            data: chartData.efficiency,
            tooltip: {
              valueSuffix: '%'
            },
            events: {
              show: this.updateEfficiencyRef.bind(this),
              hide: this.updateEfficiencyRef.bind(this)
            }
          },
          {
            id: 'productivity',
            name: t('reports', 'coeffs:productivity'),
            color: COLOR_PRODUCTIVITY,
            type: 'line',
            yAxis: 1,
            data: chartData.productivity,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour',
            events: {
              show: this.updateProductivityRef.bind(this),
              hide: this.updateProductivityRef.bind(this)
            }
          },
          {
            id: 'productivityNoWh',
            name: t('reports', 'coeffs:productivityNoWh'),
            color: COLOR_PRODUCTIVITY_NO_WH,
            type: 'line',
            yAxis: 1,
            data: chartData.productivityNoWh,
            tooltip: {
              valueSuffix: '%'
            },
            visible: this.model.query.get('interval') !== 'hour',
            events: {
              show: this.updateProductivityNoWhRef.bind(this),
              hide: this.updateProductivityNoWhRef.bind(this)
            }
          },
          {
            id: 'scheduledDowntime',
            name: t('reports', 'coeffs:scheduledDowntime'),
            color: COLOR_DOWNTIME,
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.scheduledDowntime,
            tooltip: {
              valueSuffix: '%'
            }
          },
          {
            id: 'unscheduledDowntime',
            name: t('reports', 'coeffs:unscheduledDowntime'),
            color: COLOR_DOWNTIME,
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.unscheduledDowntime,
            tooltip: {
              valueSuffix: '%'
            }
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var min = 0;

      if (!chartData.quantityDone.length)
      {
        min = null;
      }

      this.chart.yAxis[1].setExtremes(min, null, false);

      var visible = this.model.query.get('interval') !== 'hour';
      var markerStyles = this.getMarkerStyles(chartData.quantityDone.length);
      var series = this.chart.series;

      series[0].update({marker: markerStyles}, false);
      series[1].update({marker: markerStyles}, false);
      series[2].update({marker: markerStyles, visible: visible}, false);
      series[3].update({marker: markerStyles, visible: visible}, false);
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

      this.updateEfficiencyRef();
      this.updateProductivityRef();
      this.updateProductivityNoWhRef();
    },

    updatePlotLine: function(metric, dashStyle)
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

      if (!series.visible)
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
        dashStyle: dashStyle || 'dash',
        value: metricRef,
        width: 2,
        zIndex: 4
      });
    },

    updateEfficiencyRef: function()
    {
      this.updatePlotLine('efficiency');
    },

    updateProductivityRef: function()
    {
      this.updatePlotLine('productivity');
    },

    updateProductivityNoWhRef: function()
    {
      this.updatePlotLine('productivityNoWh');
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
    }

  });
});
