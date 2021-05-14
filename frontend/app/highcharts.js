// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'highcharts',
  'highcharts/modules/exporting',
  'highcharts/modules/no-data-to-display',
  'highcharts/modules/grouped-categories',
  './i18n',
  './time',
  './broker',
  './viewport',
  'i18n!app/nls/core'
], function(
  _,
  $,
  Highcharts,
  exporting,
  noDataToDisplay,
  groupedCategories,
  t,
  time,
  broker,
  viewport
) {
  'use strict';

  groupedCategories(Highcharts);

  var oldGetTooltipPosition = Highcharts.Tooltip.prototype.getPosition;

  Highcharts.Tooltip.prototype.getPosition = function(boxWidth, boxHeight, point)
  {
    var pos = oldGetTooltipPosition.call(this, boxWidth, boxHeight, point);

    if (pos.y < this.chart.plotTop + 5)
    {
      pos.y = this.chart.plotTop + 5;
    }

    return pos;
  };

  Highcharts.Chart.prototype.exportChart = function(exportingOptions, chartOptions)
  {
    var svg = this.getSVGForExport(exportingOptions, chartOptions);

    exportingOptions = Highcharts.merge(this.options.exporting, exportingOptions);

    var data = _.assign(
      {
        filename: exportingOptions.filename || this.getFilename(),
        type: exportingOptions.type,
        width: exportingOptions.width,
        scale: exportingOptions.scale,
        svg: svg
      },
      exportingOptions.formAttributes
    );

    var req = $.ajax({
      method: 'POST',
      url: exportingOptions.url,
      dataType: null,
      dataFilter: function(data) { return data; },
      data: JSON.stringify(data)
    });

    if (exportingOptions.handleResponse !== false)
    {
      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('core', 'MSG:EXPORTING_FAILURE')
        });
      });

      req.done(function(key)
      {
        window.open('/reports;download?key=' + key);
      });
    }

    return req;
  };

  _.assign(Highcharts.Axis.prototype.defaultYAxisOptions, {
    maxPadding: 0.01,
    minPadding: 0.01
  });

  Highcharts.getDefaultMenuItems = getDefaultMenuItems;

  Highcharts.formatTableTooltip = function(header, rows)
  {
    var decimalPoint = t('core', 'highcharts:decimalPoint');
    var str = header ? ('<b class="highcharts-tooltip-header">' + header + '</b>') : '';

    str += '<table class="highcharts-tooltip">';

    rows.forEach(function(row)
    {
      var yPrefix = row.prefix || '';
      var ySuffix = row.suffix || '';
      var valueStyle = ' style="' + (row.valueStyle || '') + '"';

      str += '<tr><td class="highcharts-tooltip-label">'
        + '<span style="color: ' + row.color + '">\u25cf</span> ' + row.name + ':</td>';

      if (typeof row.value === 'number')
      {
        var yParts = Highcharts.numberFormat(row.value, row.decimals).split(decimalPoint);
        var integer = yParts[0];
        var fraction = yParts.length === 2 ? (decimalPoint + yParts[1]) : '';

        str += '<td class="highcharts-tooltip-integer"' + valueStyle + '>' + yPrefix + integer + '</td>'
          + '<td class="highcharts-tooltip-fraction"' + valueStyle + '>' + fraction + '</td>'
          + '<td class="highcharts-tooltip-suffix"' + valueStyle + '>' + ySuffix + '</td>';
      }
      else
      {
        str += '<td colspan="3" class="highcharts-tooltip-string"' + valueStyle + '>' + row.value + '</td>';
      }

      str += (row.extraColumns || '') + '</tr>';
    });

    str += '</table>';

    return str;
  };

  Highcharts.setOptions({
    global: {
      timezoneOffset: time.getMoment().utcOffset(),
      useUTC: false
    },
    chart: {
      zoomType: 'x',
      animation: false,
      resetZoomButton: {
        theme: {
          style: {
            top: 'display: none'
          }
        }
      }
    },
    plotOptions: {
      series: {
        animation: false
      }
    },
    credits: {
      enabled: false
    },
    legend: {
      borderRadius: 0,
      borderWidth: 1,
      borderColor: '#E3E3E3',
      backgroundColor: '#F5F5F5',
      itemStyle: {
        fontSize: '10px',
        fontWeight: 'normal',
        fontFamily: 'Arial, sans-serif'
      }
    },
    tooltip: {
      borderColor: '#000',
      borderWidth: 1,
      borderRadius: 0,
      backgroundColor: 'rgba(255,255,255,.85)',
      shadow: false,
      shape: 'square',
      hideDelay: 250,
      useHTML: true,
      displayHeader: true,
      style: {
        pointerEvents: 'auto',
        color: '#000'
      },
      formatter: function()
      {
        var header;
        var rows = [];
        var tooltipOptions = (this.point || this.points[0]).series.chart.tooltip.options;
        var headerFormatter = tooltipOptions.headerFormatter;
        var rowNameFormatter = tooltipOptions.rowNameFormatter || formatTooltipRowName;
        var valueFormatter = tooltipOptions.valueFormatter || formatTooltipValue;

        if (typeof headerFormatter === 'function')
        {
          header = headerFormatter(this);
        }
        else if (this.key)
        {
          header = this.key;
        }
        else if (this.points)
        {
          header = this.points[0].key;
        }
        else if (this.series)
        {
          header = this.series.name;
        }
        else
        {
          header = this.x;
        }

        var points = this.points || [{
          point: this.point,
          series: this.point.series
        }];

        points.forEach(function(point)
        {
          point = point.point;

          var options = point.series.tooltipOptions;

          rows.push({
            point: point,
            color: point.series.userOptions.tooltipColor || point.color || point.series.color,
            name: rowNameFormatter(point),
            prefix: typeof options.valuePrefix === 'function' ? options.valuePrefix(point) : options.valuePrefix,
            suffix: typeof options.valueSuffix === 'function' ? options.valueSuffix(point) : options.valueSuffix,
            decimals: options.valueDecimals,
            value: (options.valueFormatter || valueFormatter)(point)
          });
        });

        if (tooltipOptions.extraRowsProvider)
        {
          var newRows = tooltipOptions.extraRowsProvider(points, rows);

          if (Array.isArray(newRows))
          {
            rows = newRows;
          }
        }

        return Highcharts.formatTableTooltip(header, rows);
      }
    },
    exporting: {
      chartOptions: {
        chart: {
          spacing: [10, 10, 10, 10]
        }
      },
      scale: 1,
      sourceWidth: 842,
      sourceHeight: 595,
      url: '/reports;export?delay=1&inline=0'
    },
    loading: {
      labelStyle: {
        top: '20%'
      }
    }
  });

  setDateLangOptions();

  broker.subscribe('i18n.reloaded', setDateLangOptions);

  function setDateLangOptions()
  {
    Highcharts.setOptions({
      lang: {
        contextButtonTitle: t('core', 'highcharts:contextButtonTitle'),
        downloadJPEG: t('core', 'highcharts:downloadJPEG'),
        downloadPDF: t('core', 'highcharts:downloadPDF'),
        downloadPNG: t('core', 'highcharts:downloadPNG'),
        downloadSVG: t('core', 'highcharts:downloadSVG'),
        printChart: t('core', 'highcharts:printChart'),
        noData: t('core', 'highcharts:noData'),
        resetZoom: t('core', 'highcharts:resetZoom'),
        resetZoomTitle: t('core', 'highcharts:resetZoomTitle'),
        loading: t('core', 'highcharts:loading'),
        decimalPoint: t('core', 'highcharts:decimalPoint'),
        thousandsSep: t('core', 'highcharts:thousandsSep'),
        shortMonths: t('core', 'highcharts:shortMonths').split('_'),
        weekdays: t('core', 'highcharts:weekdays').split('_'),
        months: t('core', 'highcharts:months').split('_')
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: getDefaultMenuItems()
          }
        }
      }
    });
  }

  function getDefaultMenuItems()
  {
    return [{
      text: t('core', 'highcharts:downloadPDF'),
      onclick: _.partial(exportChart, 'application/pdf')
    }, {
      text: t('core', 'highcharts:downloadPNG'),
      onclick: _.partial(exportChart, 'image/png')
    }];
  }

  function exportChart(type)
  {
    var plotOptions = {
      dataLabels: {
        enabled: !this.userOptions.exporting || this.userOptions.exporting.dataLabels !== false,
        padding: 0,
        allowOverlap: false,
        formatter: formatDataLabelForExport
      }
    };

    var originalEvents = this.options.chart.events;

    this.exportChart({type: type}, {
      chart: {
        events: {
          load: function()
          {
            if (originalEvents && originalEvents.load)
            {
              originalEvents.load.apply(this, arguments);
            }

            _.forEach(this.series, function(series)
            {
              series.update(plotOptions);
            });
          }
        }
      }
    });
  }

  function formatDataLabelForExport()
  {
    var series = this.series;
    var chartOptions = series.chart.options;
    var chartType = chartOptions.chart.type;

    if (chartOptions.exporting.noDataLabels
      || this.y === null
      || (this.y === 0 && chartType !== 'pie'))
    {
      return '';
    }

    var y = Highcharts.numberFormat(this.y, 1);

    if (/[^0-9]0$/.test(y))
    {
      y = Highcharts.numberFormat(this.y, 0);
    }

    return y;
  }

  function formatTooltipRowName(point)
  {
    return point.series.name;
  }

  function formatTooltipValue(point)
  {
    return point.y;
  }

  return Highcharts;
});
