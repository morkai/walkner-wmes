define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/data/orgUnits',
  'app/data/views/renderOrgUnitPath',
  'app/highcharts'
], function(
  _,
  $,
  time,
  t,
  View,
  orgUnits,
  renderOrgUnitPath,
  Highcharts
) {
  'use strict';

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
          zoomType: 'x',
          resetZoomButton: {
            relativeTo: 'chart',
            position: {
              y: 5
            }
          },
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

            $.each(this.points, function(i, point)
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
            name: t('reports', 'coeffs:quantityDone'),
            color: '#00aaff',
            type: 'area',
            yAxis: 0,
            data: chartData.quantityDone,
            tooltip: {
              valueSuffix: t('reports', 'quantitySuffix')
            }
          },
          {
            name: t('reports', 'coeffs:efficiency'),
            color: '#00ee00',
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
            name: t('reports', 'coeffs:productivity'),
            color: '#ffaa00',
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
            name: t('reports', 'coeffs:downtime'),
            color: 'rgba(255, 0, 0, .75)',
            borderColor: '#AC2925',
            borderWidth: 0,
            type: 'column',
            yAxis: 1,
            data: chartData.downtime,
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

      this.chart.series[0].update({marker: markerStyles}, false);
      this.chart.series[1].update({marker: markerStyles}, false);
      this.chart.series[2].update({marker: markerStyles, visible: visible}, false);
      this.chart.series[3].update({marker: markerStyles}, false);

      this.chart.series[0].setData(chartData.quantityDone, false);
      this.chart.series[1].setData(chartData.efficiency, false);
      this.chart.series[2].setData(chartData.productivity, false);
      this.chart.series[3].setData(chartData.downtime, true);

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

    updateEfficiencyRef: function()
    {
      if (this.chart)
      {
        this.updatePlotLine(
          'efficiency', this.chart.yAxis[1], this.chart.series[1], '#00ee00', 'dash'
        );
      }
    },

    updateProductivityRef: function()
    {
      if (this.chart)
      {
        this.updatePlotLine(
          'productivity', this.chart.yAxis[1], this.chart.series[2], '#ffaa00', 'dash'
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

      if (metricInfo.metric !== 'efficiency' && metricInfo.metric !== 'productivity')
      {
        return;
      }

      if (metricInfo.orgUnit !== this.getMetricRefOrgUnitId())
      {
        return;
      }

      if (metricInfo.metric === 'efficiency')
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
