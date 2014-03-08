define([
  'highcharts',
  './i18n',
  './time',
  './broker',
  'highcharts-noData'
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
    lang: {
      noData: t('core', 'highcharts:noData'),
      resetZoom: t('core', 'highcharts:resetZoom'),
      resetZoomTitle: t('core', 'highcharts:resetZoomTitle'),
      loading: t('core', 'highcharts:loading')
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
    }
  });

  setDateLangOptions();

  broker.subscribe('i18n.reloaded', setDateLangOptions);

  function setDateLangOptions()
  {
    Highcharts.setOptions({
      lang: {
        decimalPoint: t('core', 'highcharts:decimalPoint'),
        thousandsSep: t('core', 'highcharts:thousandsSep'),
        shortMonths: t('core', 'highcharts:shortMonths').split('_'),
        weekdays: t('core', 'highcharts:weekdays').split('_'),
        months: t('core', 'highcharts:months').split('_')
      }
    });
  }

  return Highcharts;
});
