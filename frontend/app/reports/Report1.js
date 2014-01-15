define([
  'underscore',
  '../i18n',
  '../data/aors',
  '../data/downtimeReasons',
  '../core/Model'
], function(
  _,
  t,
  aors,
  downtimeReasons,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/1',

    defaults: {
      coeffs: null,
      downtimesByAor: null,
      downtimesByReason: null
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.defaults(options.data || {}, this.query);

      return Model.prototype.fetch.call(this, options);
    },

    initialize: function(data, options)
    {
      this.query = options.query || {};

      if (this.attributes.coeffs === null)
      {
        this.attributes.coeffs = {
          quantityDone: [],
          downtime: [],
          efficiency: [],
          productivity: []
        };
      }
    },

    parse: function(report)
    {
      return {
        coeffs: this.parseCoeffs(report.coeffs),
        downtimesByAor:
          this.parseDowntimesByAor(report.downtimes.byAor).sort(this.sortByValueDesc),
        downtimesByReason:
          this.parseDowntimesByReason(report.downtimes.byReason).sort(this.sortByValueDesc)
      };
    },

    parseCoeffs: function(timeToCoeffs)
    {
      var series = {
        quantityDone: [],
        downtime: [],
        efficiency: [],
        productivity: []
      };

      Object.keys(timeToCoeffs).forEach(function(time)
      {
        var coeffs = timeToCoeffs[time];

        time = Date.parse(time);

        series.quantityDone.push({x: time, y: coeffs.quantityDone || 0});
        series.downtime.push({x: time, y: Math.round((coeffs.downtime || 0) * 100)});
        series.efficiency.push({x: time, y: Math.round((coeffs.efficiency || 0) * 100)});
        series.productivity.push({x: time, y: Math.round((coeffs.productivity || 0) * 100)});

        /*series.quantityDone.push({x: time, y: Math.round(Math.random() * 3500)});
        series.downtime.push({x: time, y: Math.round(Math.random() * 100)});
        series.efficiency.push({x: time, y: Math.round(Math.random() * 100)});
        series.productivity.push({x: time, y: Math.round(Math.random() * 100)});*/
      });

      return series;
    },

    parseDowntimesByAor: function(downtimes)
    {
      var downtimesByAor = [];

      if (downtimes)
      {
        Object.keys(downtimes).forEach(function(aorId)
        {
          var longText;
          var shortText;

          if (aorId === 'null')
          {
            longText = t('reports', 'downtimesByAor:press:longText');
            shortText = t('reports', 'downtimesByAor:press:shortText');
          }
          else
          {
            var aor = aors.get(aorId);

            if (aor)
            {
              longText = aor.getLabel();
            }
            else
            {
              longText = aorId;
            }

            var dashPos = longText.indexOf('-');

            if (dashPos === -1)
            {
              shortText = longText > 13 ? (longText.substr(0, 10).trim() + '...') : longText;
            }
            else
            {
              shortText = longText.substr(0, dashPos).trim();
            }
          }

          downtimesByAor.push({
            key: aorId,
            longText: longText,
            shortText: shortText,
            value: Math.round(downtimes[aorId] * 100) / 100
          });
        });
      }

      return downtimesByAor;
    },

    parseDowntimesByReason: function(downtimes)
    {
      var downtimesByReason = [];

      if (downtimes)
      {
        Object.keys(downtimes).forEach(function(reasonId)
        {
          var downtimeReason = downtimeReasons.get(reasonId);

          downtimesByReason.push({
            key: reasonId,
            longText: downtimeReason ? downtimeReason.getLabel() : reasonId,
            shortText: reasonId,
            value: Math.round(downtimes[reasonId] * 100) / 100
          });
        });
      }

      return downtimesByReason;
    },

    sortByValueDesc: function(a, b)
    {
      return b.value - a.value;
    }

  });
});
