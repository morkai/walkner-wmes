// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        maxClipOrderCount: null,
        maxClipPercent: null
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
        throw new Error("settings option is required!");
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
        maxClipPercent: null
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

        extremes.maxClipOrderCount = Math.max(
          extremes.maxClipOrderCount,
          visibleSeries.clipOrderCount ? maxClip.orderCount : 0
        );

        extremes.maxClipPercent = Math.max(
          extremes.maxClipPercent,
          visibleSeries.clipProduction ? maxClip.production : 0,
          visibleSeries.clipEndToEnd ? maxClip.endToEnd : 0
        );
      }

      this.set(extremes);
    },

    serializeToString: function()
    {
      var extremes = this.get('extremes');
      var visibleSeries = this.get('series');
      var parts = [extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2, ''];

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

      if (parts.length !== 2)
      {
        return new Report2DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
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
