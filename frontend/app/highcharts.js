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

  Highcharts.setOptions({
    global: {
      timezoneOffset: time.getMoment().zone(),
      useUTC: false
    },
    chart: {
      zoomType: 'x',
      resetZoomButton: {
        theme: {
          style: {
            top: 'display: none'
          }
        }
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
      formatter: function()
      {
        var headerFormatter = (this.point || this.points[0]).series.chart.tooltip.options.headerFormatter;
        var str = '<b>';

        if (typeof headerFormatter === 'function')
        {
          str += headerFormatter(this);
        }
        else if (this.key)
        {
          str += this.key;
        }
        else if (this.points)
        {
          str += this.points[0].key;
        }
        else if (this.series)
        {
          str += this.series.name;
        }
        else
        {
          str += this.x;
        }

        str += '</b><table>';

        var points = this.points || [{
          point: this.point,
          series: this.point.series
        }];

        points.forEach(function(point)
        {
          point = point.point;

          var y = point.y.toLocaleString ? point.y.toLocaleString() : Highcharts.numberFormat(point.y);
          var yPrefix = point.series.tooltipOptions.valuePrefix || '';
          var ySuffix = point.series.tooltipOptions.valueSuffix || '';

          str += '<tr><td><span style="color: ' + (point.color || point.series.color) + '">\u25cf</span> '
            + point.series.name + ':</td><td>'
            + yPrefix + y + ySuffix
            + '</td></tr>';
        });

        str += '</table>';

        return str;
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
            menuItems: [{
              text: t('core', 'highcharts:downloadPDF'),
              onclick: _.partial(exportChart, 'application/pdf')
            }, {
              text: t('core', 'highcharts:downloadPNG'),
              onclick: _.partial(exportChart, 'image/png')
            }]
          }
        }
      }
    });
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

    this.exportChart({type: type}, {
      plotOptions: {
        line: plotOptions,
        column: plotOptions,
        area: plotOptions
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
      if (this.seriesIndex % 2 === 0 && this.pointIndex % 2 !== 0)
      {
        return '';
      }

      if (this.seriesIndex % 2 !== 0 && this.pointIndex % 2 === 0)
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

  return Highcharts;
});
