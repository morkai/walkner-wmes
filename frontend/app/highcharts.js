// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'highcharts',
  './i18n',
  './time',
  './broker'
], function(
  _,
  Highcharts,
  t,
  time,
  broker
) {
  'use strict';

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

  _.extend(Highcharts.Axis.prototype.defaultYAxisOptions, {
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
      var yParts = Highcharts.numberFormat(row.value, row.decimals).split(decimalPoint);
      var integer = yParts[0];
      var fraction = yParts.length === 2 ? (decimalPoint + yParts[1]) : '';
      var yPrefix = row.prefix || '';
      var ySuffix = row.suffix || '';

      str += '<tr><td class="highcharts-tooltip-label">'
        + '<span style="color: ' + row.color + '">\u25cf</span> ' + row.name + ':</td>'
        + '<td class="highcharts-tooltip-integer">' + yPrefix + integer + '</td>'
        + '<td class="highcharts-tooltip-fraction">' + fraction + '</td>'
        + '<td class="highcharts-tooltip-suffix">' + ySuffix + '</td></tr>';
    });

    str += '</table>';

    return str;
  };

  Highcharts.setOptions({
    global: {
      timezoneOffset: time.getMoment().zone(),
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
      formatter: function()
      {
        var header;
        var rows = [];
        var tooltipOptions = (this.point || this.points[0]).series.chart.tooltip.options;
        var headerFormatter = tooltipOptions.headerFormatter;
        var rowNameFormatter = tooltipOptions.rowNameFormatter || formatTooltipRowName;

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
            color: point.color || point.series.color,
            name: rowNameFormatter(point),
            prefix: options.valuePrefix,
            suffix: options.valueSuffix,
            decimals: options.valueDecimals,
            value: point.y
          });
        });

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
      sourceWidth: 848,
      sourceHeight: 600,
      url: '/reports;export'
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
    /*jshint validthis:true*/

    var plotOptions = {
      dataLabels: {
        enabled: true,
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
    /*jshint validthis:true*/

    if (this.y === null || this.y === 0)
    {
      return '';
    }

    if (this.series.type !== 'column' && this.series.points.length > 10)
    {
      if (this.series.index % 2 === 0 && this.point.index % 2 !== 0)
      {
        return '';
      }

      if (this.series.index % 2 !== 0 && this.point.index % 2 === 0)
      {
        return '';
      }
    }

    var y = Highcharts.numberFormat(this.y, 1);

    if (/.0$/.test(y))
    {
      y = Highcharts.numberFormat(this.y, 0);
    }

    return y;
  }

  function formatTooltipRowName(point)
  {
    return point.series.name;
  }

  return Highcharts;
});
