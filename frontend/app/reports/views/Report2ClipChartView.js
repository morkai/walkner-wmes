// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/data/orgUnits',
  'app/data/views/renderOrgUnitPath',
  'app/highcharts'
], function(
  time,
  t,
  View,
  orgUnits,
  renderOrgUnitPath,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-chart reports-drillingChart reports-2-clip',

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.loading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:clip', this.render);

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
      var markerStyles = this.getMarkerStyles(chartData.orderCount.length);
      var view = this;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
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
          filename: t('reports', 'filenames:2:clip')
        },
        title: {
          useHTML: true,
          text: this.getTitle()
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
                + point.y + (point.series.tooltipOptions.valueSuffix || '')
                + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
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
            name: t('reports', 'metrics:clip:orderCount'),
            color: '#00aaff',
            type: 'area',
            yAxis: 0,
            data: chartData.orderCount
          },
          {
            name: t('reports', 'metrics:clip:production'),
            color: '#aa00ff',
            type: 'line',
            yAxis: 1,
            data: chartData.production,
            tooltip: {
              valueSuffix: '%'
            },
            events: {
              show: this.updateProductionRef.bind(this),
              hide: this.updateProductionRef.bind(this)
            }
          },
          {
            name: t('reports', 'metrics:clip:endToEnd'),
            color: '#FF007F',
            type: 'line',
            yAxis: 1,
            data: chartData.endToEnd,
            tooltip: {
              valueSuffix: '%'
            },
            events: {
              show: this.updateEndToEndRef.bind(this),
              hide: this.updateEndToEndRef.bind(this)
            }
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var min = 0;

      if (!chartData.orderCount.length)
      {
        min = null;
      }

      this.chart.yAxis[1].setExtremes(min, null, false);

      var markerStyles = this.getMarkerStyles(chartData.orderCount.length);

      this.chart.series[0].update({marker: markerStyles}, false);
      this.chart.series[1].update({marker: markerStyles}, false);
      this.chart.series[2].update({marker: markerStyles}, false);

      this.chart.series[0].setData(chartData.orderCount, false);
      this.chart.series[1].setData(chartData.production, false);
      this.chart.series[2].setData(chartData.endToEnd, true);

      this.updatePlotLines();
    },

    updatePlotLines: function()
    {
      if (!this.metricRefs)
      {
        return;
      }

      this.updateProductionRef();
      this.updateEndToEndRef();
    },

    updatePlotLine: function(metric, yAxis, series, color, dashStyle)
    {
      yAxis.removePlotLine(metric);

      if (series.visible)
      {
        var metricRef = this.getMetricRef(metric);

        if (metricRef)
        {
          yAxis.addPlotLine({
            id: metric,
            color: color,
            dashStyle: dashStyle,
            value: metricRef,
            width: 2,
            zIndex: 4
          });
        }
      }
    },

    updateProductionRef: function()
    {
      if (this.chart)
      {
        this.updatePlotLine(
          'production', this.chart.yAxis[1], this.chart.series[1], '#aa00ff', 'dash'
        );
      }
    },

    updateEndToEndRef: function()
    {
      if (this.chart)
      {
        this.updatePlotLine(
          'endToEnd', this.chart.yAxis[1], this.chart.series[2], '#FF007F', 'dash'
        );
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
      return this.model.get('clip');
    },

    formatTooltipHeader: function(epoch)
    {
      /*jshint -W015*/

      var timeMoment = time.getMoment(epoch);
      var interval = this.model.query.get('interval');
      var data;

      if (interval === 'shift')
      {
        data = {
          shift:
            t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
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

    getTitle: function()
    {
      var orgUnitType = this.model.get('orgUnitType');

      if (!orgUnitType)
      {
        return t('reports', 'charts:title:overall');
      }

      var orgUnit = this.model.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, false, false);
      }

      return orgUnit.getLabel();
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

      if (metricInfo.metric !== 'production' && metricInfo.metric !== 'endToEnd')
      {
        return;
      }

      if (metricInfo.orgUnit !== this.getMetricRefOrgUnitId())
      {
        return;
      }

      if (metricInfo.metric === 'production')
      {
        this.updateEfficiencyRef();
      }
      else
      {
        this.updateProductivityRef();
      }
    }

  });
});
