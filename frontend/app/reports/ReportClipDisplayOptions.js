// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
  Model
) {
  'use strict';

  var SERIES = [
    'clipOrderCount',
    'clipProductionCount',
    'clipEndToEndCount',
    'clipProduction',
    'clipEndToEnd'
  ];

  function padLeft0(str, length)
  {
    while (str.length < length)
    {
      str = '0' + str;
    }

    return str;
  }

  return Model.extend({

    defaults: function()
    {
      var defaults = {
        series: {},
        extremes: 'none',
        zeroes: 'include',
        maxClipOrderCount: null,
        maxClipPercent: null,
        maxDelayReasonsCount: null,
        maxM4sCount: null,
        maxDrmsCount: null
      };

      SERIES.forEach(function(series)
      {
        defaults.series[series] = true;
      });

      return defaults;
    },

    initialize: function(data, options)
    {
      if (!options.settings)
      {
        throw new Error('settings option is required!');
      }

      this.settings = options.settings;
    },

    isSeriesVisible: function(series)
    {
      return !!this.get('series')[series];
    },

    updateExtremes: function(reports)
    {
      var extremes = {
        maxClipOrderCount: null,
        maxClipPercent: null,
        maxDelayReasonsCount: null,
        maxM4sCount: null,
        maxDrmsCount: null
      };

      var mode = this.get('extremes');

      if (mode === 'none')
      {
        return this.set(extremes);
      }

      var visibleSeries = this.get('series');

      for (var i = mode === 'siblings' ? 1 : 0, l = reports.length; i < l; ++i)
      {
        var report = reports[i];
        var maxClip = report.get('maxClip');
        var maxDelayReasons = report.get('maxDelayReasons');
        var maxM4s = report.get('maxM4s');
        var maxDrms = report.get('maxDrms');

        extremes.maxClipOrderCount = Math.max(
          extremes.maxClipOrderCount,
          visibleSeries.clipOrderCount ? maxClip.orderCount : 0,
          visibleSeries.clipProductionCount ? maxClip.productionCount : 0,
          visibleSeries.clipEndToEndCount ? maxClip.endToEndCount : 0
        );

        extremes.maxClipPercent = Math.max(
          extremes.maxClipPercent,
          visibleSeries.clipProduction ? maxClip.production : 0,
          visibleSeries.clipEndToEnd ? maxClip.endToEnd : 0
        );

        extremes.maxDelayReasonsCount = Math.max(
          extremes.maxDelayReasonsCount,
          maxDelayReasons
        );

        extremes.maxM4sCount = Math.max(
          extremes.maxM4sCount,
          maxM4s
        );

        extremes.maxDrmsCount = Math.max(
          extremes.maxDrmsCount,
          maxDrms
        );
      }

      this.set(extremes);
    },

    serializeToString: function()
    {
      var extremes = this.get('extremes');
      var zeroes = this.get('zeroes');
      var visibleSeries = this.get('series');
      var parts = [
        extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2,
        '',
        zeroes === 'include' ? 0 : zeroes === 'gap' ? 1 : 2
      ];

      SERIES.forEach(function(series)
      {
        parts[1] += visibleSeries[series] ? 1 : 0;
      });

      return parts.join('&');
    }

  }, {

    fromString: function(str, options)
    {
      var Report2DisplayOptions = this;
      var parts = str.split('&');

      if (parts.length < 2)
      {
        return new Report2DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
        zeroes: parts[2] === '2' ? 'ignore' : parts[2] === '1' ? 'gap' : 'include',
        series: {}
      };

      var seriesData = padLeft0(parts[1], SERIES.length);

      SERIES.forEach(function(serie, i)
      {
        if (seriesData[i] === '1')
        {
          attrs.series[serie] = true;
        }
      });

      return new Report2DisplayOptions(attrs, options);
    }

  });
});
