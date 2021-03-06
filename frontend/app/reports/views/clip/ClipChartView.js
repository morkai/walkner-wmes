// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/viewport',
  'app/user',
  'app/highcharts',
  'app/core/View',
  'app/core/util/pageActions',
  'app/data/orgUnits',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  time,
  viewport,
  user,
  Highcharts,
  View,
  pageActions,
  orgUnits,
  renderOrgUnitPath,
  formatTooltipHeader,
  formatXAxis
) {
  'use strict';

  return View.extend({

    className: 'reports-chart reports-drillingChart reports-2-clip',

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:clip', this.render);
      this.listenTo(this.settings, 'add change', this.onSettingsUpdate);

      if (this.displayOptions)
      {
        this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
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

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
        else if (!this.displayOptions)
        {
          this.updateExtremes();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chart = this.chart;
      var chartData = this.serializeChartData();

      this.updateExtremes(false);

      var dataSize = chartData.orderCount.length;
      var markerStyles = this.getMarkerStyles(dataSize);
      var series = chart.series;

      for (var i = 0; i < series.length; ++i)
      {
        var seriesOptions = _.assign(
          {marker: markerStyles},
          series[i].userOptions[dataSize === 1 ? 'singleOptions' : 'multiOptions']
        );

        series[i].update(seriesOptions, false);
      }

      series[0].setData(chartData.orderCount, false);
      series[1].setData(chartData.productionCount, false);
      series[2].setData(chartData.endToEndCount, false);
      series[3].setData(chartData.production, false);
      series[4].setData(chartData.endToEnd, true);
    },

    serializeChartData: function()
    {
      var clip = this.model.get('clip');
      var zeroes = this.displayOptions ? this.displayOptions.get('zeroes') : 'include';
      var chartData = {};

      if (zeroes === 'ignore')
      {
        _.forEach(clip, function(data, series)
        {
          chartData[series] = data.filter(function(point)
          {
            return !!point.y;
          });
        });
      }
      else if (zeroes === 'gap')
      {
        _.forEach(clip, function(data, series)
        {
          chartData[series] = data.map(function(point)
          {
            return point.y ? point : _.assign({}, point, {y: null});
          });
        });
      }
      else
      {
        chartData = clip;
      }

      return chartData;
    },

    formatTooltipHeader: formatTooltipHeader,

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

    getTitle: function(link)
    {
      var orgUnitType = this.model.get('orgUnitType');

      if (!orgUnitType)
      {
        return this.t('charts:title:overall');
      }

      var orgUnit = this.model.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, link, false);
      }

      return orgUnit.getLabel();
    },

    updateExtremes: function(redraw)
    {
      var displayOptions = this.displayOptions;

      if (!displayOptions)
      {
        this.chart.yAxis[0].setExtremes(0, null, false, false);
        this.chart.yAxis[1].setExtremes(0, null, redraw, false);

        return;
      }

      var useMax = !this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent');
      var maxClipOrderCount = null;
      var maxClipPercent = null;

      if (useMax)
      {
        var productionVisible = displayOptions.isSeriesVisible('clipProduction');
        var endToEndVisible = displayOptions.isSeriesVisible('clipEndToEnd');

        maxClipOrderCount = displayOptions.isSeriesVisible('clipOrderCount')
          ? displayOptions.get('maxClipOrderCount')
          : null;
        maxClipPercent = productionVisible || endToEndVisible
          ? displayOptions.get('maxClipPercent')
          : null;
      }

      this.chart.yAxis[0].setExtremes(0, maxClipOrderCount, false, false);
      this.chart.yAxis[1].setExtremes(0, maxClipPercent, redraw, false);
    },

    updateColor: function(metric, color)
    {
      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    },

    onSettingsUpdate: function(setting)
    {
      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var update = !!changes.zeroes;
      var redraw = false;

      if (changes.series)
      {
        var visibleSeries = this.displayOptions.get('series');

        this.chart.series.forEach(function(series)
        {
          var visible = !!visibleSeries[series.options.id];

          if (series.visible !== visible)
          {
            series.setVisible(visible, false);

            redraw = true;
          }
        });
      }

      if (changes.maxClipOrderCount !== undefined || changes.maxClipPercent !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      if (update)
      {
        this.updateChart();
      }
      else if (redraw)
      {
        this.chart.redraw(false);
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
    },

    createChart: function()
    {
      var view = this;
      var chartData = view.serializeChartData();
      var markerStyles = view.getMarkerStyles(chartData.orderCount.length);
      var displayOptions = view.displayOptions;
      var orderCountColor = view.settings.getColor('clipOrderCount');
      var productionColor = view.settings.getColor('clipProduction');
      var endToEndColor = view.settings.getColor('clipEndToEnd');
      var multiDataLabels = {
        enabled: false
      };
      var singleDataLabels = {
        enabled: true,
        formatter: function()
        {
          return Math.floor(this.y);
        }
      };
      var menuItems = Highcharts.getDefaultMenuItems().concat([
        {
          text: view.t('clip:exportMetrics'),
          onclick: view.exportMetrics.bind(view)
        },
        {
          text: view.t('clip:exportOrders'),
          onclick: view.exportOrders.bind(view)
        }
      ]);

      if (view.model.get('orgUnitType') === 'mrpController' && user.isAllowedTo('PROD_DATA:VIEW'))
      {
        menuItems.push({
          text: view.t('clip:showLineOrders'),
          onclick: view.showLineOrders.bind(view)
        });
      }

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: view.t('filenames:2:clip'),
          buttons: {
            contextButton: {
              menuItems: menuItems
            }
          }
        },
        title: {
          text: view.getTitle(false)
        },
        noData: {},
        tooltip: {
          shared: true,
          headerFormatter: view.formatTooltipHeader.bind(view),
          valueDecimals: 0
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
        xAxis: {
          type: 'datetime',
          labels: formatXAxis.labels(view)
        },
        yAxis: [
          {
            title: false,
            min: 0
          },
          {
            title: false,
            opposite: true,
            labels: {
              format: '{value}%'
            },
            min: 0
          }
        ],
        series: [
          {
            id: 'clipOrderCount',
            name: view.t('metrics:clip:orderCount'),
            color: orderCountColor,
            type: 'area',
            yAxis: 0,
            data: chartData.orderCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount'),
            multiOptions: {
              type: 'area',
              dataLabels: multiDataLabels
            },
            singleOptions: {
              type: 'column',
              dataLabels: singleDataLabels
            }
          },
          {
            id: 'clipProductionCount',
            name: view.t('metrics:clip:productionCount'),
            color: productionColor,
            type: 'line',
            dashStyle: 'LongDash',
            yAxis: 0,
            data: chartData.productionCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount'),
            multiOptions: {
              type: 'line',
              color: productionColor,
              dashStyle: 'LongDash',
              dataLabels: multiDataLabels
            },
            singleOptions: {
              type: 'column',
              borderWidth: 4,
              borderColor: productionColor,
              color: orderCountColor,
              dashStyle: 'Solid',
              dataLabels: singleDataLabels
            },
            tooltipColor: productionColor
          },
          {
            id: 'clipEndToEndCount',
            name: view.t('metrics:clip:endToEndCount'),
            color: endToEndColor,
            type: 'line',
            dashStyle: 'LongDash',
            yAxis: 0,
            data: chartData.endToEndCount,
            visible: !displayOptions || displayOptions.isSeriesVisible('clipOrderCount'),
            multiOptions: {
              type: 'line',
              color: endToEndColor,
              dashStyle: 'LongDash',
              dataLabels: multiDataLabels
            },
            singleOptions: {
              type: 'column',
              borderWidth: 4,
              borderColor: endToEndColor,
              color: orderCountColor,
              dashStyle: 'Solid',
              dataLabels: singleDataLabels
            },
            tooltipColor: endToEndColor
          },
          {
            id: 'clipProduction',
            name: view.t('metrics:clip:production'),
            color: productionColor,
            type: 'line',
            yAxis: 1,
            data: chartData.production,
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 1
            },
            visible: !displayOptions || displayOptions.isSeriesVisible('clipProduction'),
            multiOptions: {
              type: 'line',
              dataLabels: multiDataLabels
            },
            singleOptions: {
              type: 'column',
              dataLabels: singleDataLabels
            }
          },
          {
            id: 'clipEndToEnd',
            name: view.t('metrics:clip:endToEnd'),
            color: endToEndColor,
            type: 'line',
            yAxis: 1,
            data: chartData.endToEnd,
            tooltip: {
              valueSuffix: '%',
              valueDecimals: 1
            },
            visible: !displayOptions || displayOptions.isSeriesVisible('clipEndToEnd'),
            multiOptions: {
              type: 'line',
              dataLabels: multiDataLabels
            },
            singleOptions: {
              type: 'column',
              dataLabels: singleDataLabels
            }
          }
        ]
      });
    },

    serializeToCsv: function()
    {
      var lines = ['date;readableDate;total;production;end2end;clipProd;clipE2e'];
      var series = this.chart.series;
      var points = series[0].data;

      for (var i = 0; i < points.length; ++i)
      {
        lines.push(
          time.format(points[i].x, 'YYYY-MM-DD')
          + ';"' + this.formatTooltipHeader(points[i].x) + '"'
          + ';' + series[0].data[i].y.toLocaleString()
          + ';' + series[1].data[i].y.toLocaleString()
          + ';' + series[2].data[i].y.toLocaleString()
          + ';' + series[3].data[i].y.toLocaleString()
          + ';' + series[4].data[i].y.toLocaleString()
        );
      }

      return lines.join('\r\n');
    },

    exportMetrics: function()
    {
      var view = this;

      var $msg = viewport.msg.show({
        type: 'warning',
        text: view.t('core', 'MSG:EXPORTING')
      });

      var orgUnit = view.getTitle(null);
      var orgUnitType = view.model.get('orgUnitType');
      var mrps = !orgUnitType || orgUnitType === 'division' || orgUnitType === 'subdivision'
        ? (view.model.get('clip').mrps || {})
        : {};
      var series = view.chart.series;
      var points = series[0].data;
      var data = [];

      points.forEach(function(point, i)
      {
        var parent = {
          orgUnitType: orgUnitType,
          orgUnit: orgUnit,
          date: new Date(point.x),
          dateLong: view.formatTooltipHeader(point.x),
          dateShort: formatXAxis(view, {value: point.x}),
          total: series[0].data[i].y,
          production: series[1].data[i].y,
          end2end: series[2].data[i].y,
          clipProd: series[3].data[i].y,
          clipE2E: series[4].data[i].y
        };

        data.push(parent);

        Object.keys(mrps[i]).forEach(function(mrp)
        {
          var metrics = mrps[i][mrp];

          data.push({
            orgUnitType: 'mrpController',
            orgUnit: mrp,
            date: parent.date,
            dateLong: parent.dateLong,
            dateShort: parent.dateShort,
            total: metrics[0],
            production: metrics[1],
            end2end: metrics[2],
            clipProd: Math.round(metrics[1] / metrics[0] * 1000) / 10 || 0,
            clipE2E: Math.round(metrics[2] / metrics[0] * 1000) / 10 || 0
          });
        });
      });

      var req = view.ajax({
        method: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify({
          filename: 'WMES-CLIP_METRICS',
          freezeRows: 1,
          freezeColumns: 0,
          columns: {
            orgUnitType: 15,
            orgUnit: 20,
            date: 'date',
            dateLong: 30,
            dateShort: 10,
            total: 'integer',
            production: 'integer',
            end2end: 'integer',
            clipProd: 'decimal',
            clipE2E: 'decimal'
          },
          data: data
        })
      });

      req.fail(function()
      {
        viewport.msg.hide($msg, true);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('core', 'MSG:EXPORTING_FAILURE')
        });
      });

      req.done(function(id)
      {
        viewport.msg.hide($msg, true);

        pageActions.exportXlsx('/xlsxExporter/' + id);
      });
    },

    exportOrders: function()
    {
      var findDateProperty = this.settings.getValue('clip.findDateProperty');
      var requiredStatuses = this.settings.getValue('clip.requiredStatuses');
      var ignoredStatuses = this.settings.getValue('clip.ignoredStatuses');
      var mrps = this.model.get('mrps');
      var from = this.model.get('fromTimeLocal');
      var to = this.model.get('toTimeLocal');
      var url = '/orders;export.xlsx'
        + '?' + findDateProperty + '>=' + from
        + '&' + findDateProperty + '<' + to;

      if (!_.isEmpty(requiredStatuses))
      {
        url += '&statuses=in=(' + requiredStatuses.join(',') + ')';
      }

      if (!_.isEmpty(ignoredStatuses))
      {
        url += '&statuses=nin=(' + ignoredStatuses.join(',') + ')';
      }

      if (!_.isEmpty(mrps))
      {
        url += '&mrp=in=(' + mrps.join(',') + ')';
      }

      pageActions.exportXlsx(url);
    },

    showLineOrders: function()
    {
      var orgUnitType = this.model.query.get('orgUnitType');
      var orgUnitId = this.model.query.get('orgUnitId');
      var orgUnit = orgUnits.getByTypeAndId(orgUnitType, orgUnitId);
      var division = orgUnits.getDivisionFor(orgUnit);
      var url = '/#prodShiftOrders'
        + '?exclude(creator,losses,orderData.bom,orderData.documents)&sort(-startedAt)&limit(30)'
        + '&startedAt=ge=' + time.getMoment(+this.model.query.get('from')).subtract(7, 'days').valueOf()
        + '&startedAt=lt=' + time.getMoment(+this.model.query.get('to')).add(7, 'days').valueOf()
        + '&orderData.mrp=in=(' + this.model.get('mrps').join(',') + ')';

      if (division)
      {
        url += '&division=' + encodeURIComponent(division.id);
      }

      window.open(url);
    }

  });
});
