// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'highcharts',
  './i18n',
  './time',
  './broker',
  'highcharts-noData',
  'highcharts-exporting'
], function(
  Highcharts,
  t,
  time,
  broker
) {
  'use strict';

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
      borderColor: '#E3E3E3',
      backgroundColor: '#F5F5F5',
      itemStyle: {
        fontSize: '10px'
      }
    },
    tooltip: {
      borderColor: '#999999'
    },
    exporting: {
      chartOptions: {
        chart: {
          spacing: [10, 10, 10, 10]
        }
      },
      scale: 2,
      sourceWidth: 800,
      sourceHeight: 600,
      url: '/reports;export'
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
              onclick: function() { this.exportChart({type: 'application/pdf'}); }
            }, {
              text: t('core', 'highcharts:downloadPNG'),
              onclick: function() { this.exportChart({type: 'image/png'}); }
            }]
          }
        }
      }
    });
  }

  return Highcharts;
});
