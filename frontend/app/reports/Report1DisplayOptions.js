// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../data/aors',
  '../data/downtimeReasons'
], function(
  _,
  Model,
  aors,
  downtimeReasons
) {
  'use strict';

  var SERIES = [
    'quantityDone',
    'scheduledDowntime',
    'unscheduledDowntime',
    'efficiency',
    'productivity',
    'productivityNoWh'
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
        aors: {},
        reasons: {},
        extremes: 'none',
        skipEmpty: false,
        maxQuantityDone: null,
        maxPercentCoeff: null,
        maxDowntimesByAor: null,
        maxDowntimesByReason: null,
        references: {}
      };

      SERIES.forEach(function(series)
      {
        defaults.series[series] = true;
        defaults.references[series] = true;
      });

      aors.forEach(function(aor)
      {
        defaults.aors[aor.id] = true;
        defaults.references[aor.id] = true;
      });

      downtimeReasons.forEach(function(downtimeReason)
      {
        defaults.reasons[downtimeReason.id] = true;
        defaults.references[downtimeReason.id] = true;
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

    isReferenceVisible: function(reference)
    {
      return !!this.get('references')[reference];
    },

    updateExtremes: function(reports)
    {
      var extremes = {
        maxQuantityDone: null,
        maxPercentCoeff: null,
        maxDowntimesByAor: null,
        maxDowntimesByReason: null
      };

      var mode = this.get('extremes');

      if (mode === 'none')
      {
        return this.set(extremes);
      }

      var visibleSeries = this.get('series');
      var visibleAors = this.get('aors');
      var visibleReasons = this.get('reasons');
      var visibleReferences = this.get('references');

      for (var i = mode === 'siblings' ? 1 : 0, l = reports.length; i < l; ++i)
      {
        var report = reports[i];
        var maxCoeffs = report.get('maxCoeffs');
        var orgUnitId = report.getReferenceOrgUnitId();

        extremes.maxQuantityDone = Math.max(
          extremes.maxQuantityDone,
          visibleSeries.quantityDone ? maxCoeffs.quantityDone : 0
        );

        extremes.maxPercentCoeff = Math.max(
          extremes.maxPercentCoeff,
          visibleSeries.scheduledDowntime ? maxCoeffs.scheduledDowntime : 0,
          visibleSeries.scheduledDowntime && visibleReferences.scheduledDowntime
            ? this.settings.getReference('scheduledDowntime', orgUnitId) : 0,
          visibleSeries.unscheduledDowntime ? maxCoeffs.unscheduledDowntime : 0,
          visibleSeries.unscheduledDowntime && visibleReferences.unscheduledDowntime
            ? this.settings.getReference('unscheduledDowntime', orgUnitId) : 0,
          visibleSeries.efficiency ? maxCoeffs.efficiency : 0,
          visibleSeries.efficiency && visibleReferences.efficiency
            ? this.settings.getReference('efficiency', orgUnitId) : 0,
          visibleSeries.productivity ? maxCoeffs.productivity : 0,
          visibleSeries.productivity && visibleReferences.productivity
            ? this.settings.getReference('productivity', orgUnitId) : 0,
          visibleSeries.productivityNoWh ? maxCoeffs.productivityNoWh : 0,
          visibleSeries.productivityNoWh && visibleReferences.productivityNoWh
            ? this.settings.getReference('productivityNoWh', orgUnitId) : 0
        );

        extremes.maxDowntimesByAor = Math.max(
          extremes.maxDowntimesByAor,
          report.getMaxDowntimesByAor(visibleAors, visibleReferences)
        );

        extremes.maxDowntimesByReason = Math.max(
          extremes.maxDowntimesByReason,
          report.getMaxDowntimesByReason(visibleReasons, visibleReferences)
        );
      }

      this.set(extremes);
    },

    serializeToString: function()
    {
      var extremes = this.get('extremes');
      var visibleSeries = this.get('series');
      var visibleReferences = this.get('references');
      var visibleAors = this.get('aors');
      var visibleReasons = this.get('reasons');
      var parts = [
        extremes === 'none' ? 0 : extremes === 'siblings' ? 1 : 2,
        '',
        '',
        '',
        this.get('skipEmpty') ? '1' : '0'
      ];

      SERIES.forEach(function(series)
      {
        parts[1] += visibleSeries[series] ? 1 : 0;
        parts[1] += visibleReferences[series] ? 1 : 0;
      });

      aors.forEach(function(aor)
      {
        parts[2] += visibleAors[aor.id] ? 1 : 0;
        parts[2] += visibleReferences[aor.id] ? 1 : 0;
      });

      downtimeReasons.forEach(function(reason)
      {
        parts[3] += visibleReasons[reason.id] ? 1 : 0;
        parts[3] += visibleReferences[reason.id] ? 1 : 0;
      });

      return parts.join('&');
    }

  }, {

    fromString: function(str, options)
    {
      var Report1DisplayOptions = this;
      var parts = str.split('&');

      if (parts.length < 4)
      {
        return new Report1DisplayOptions(null, options);
      }

      var attrs = {
        extremes: parts[0] === '2' ? 'parent' : parts[0] === '1' ? 'siblings' : 'none',
        series: {},
        aors: {},
        reasons: {},
        references: {},
        skipEmpty: false
      };

      var i;
      var j;

      var seriesData = padLeft0(parts[1], SERIES.length * 2);

      for (i = SERIES.length * 2 - 1, j = SERIES.length - 1; i > 0; --i, --j)
      {
        if (seriesData[i] === '1')
        {
          attrs.references[SERIES[j]] = true;
        }

        if (seriesData[--i] === '1')
        {
          attrs.series[SERIES[j]] = true;
        }
      }

      var aorsData = padLeft0(parts[2], aors.length * 2);

      for (i = aors.length * 2 - 1, j = aors.length - 1; i > 0; --i, --j)
      {
        var aor = aors.at(j);

        if (aorsData[i] === '1')
        {
          attrs.references[aor.id] = true;
        }

        if (aorsData[--i] === '1')
        {
          attrs.aors[aor.id] = true;
        }
      }

      var reasonsData = padLeft0(parts[3], downtimeReasons.length * 2);

      for (i = downtimeReasons.length * 2 - 1, j = downtimeReasons.length - 1; i > 0; --i, --j)
      {
        var reason = downtimeReasons.at(j);

        if (reasonsData[i] === '1')
        {
          attrs.references[reason.id] = true;
        }

        if (reasonsData[--i] === '1')
        {
          attrs.reasons[reason.id] = true;
        }
      }

      attrs.skipEmpty = parts[4] === '1';

      return new Report1DisplayOptions(attrs, options);
    }

  });
});
