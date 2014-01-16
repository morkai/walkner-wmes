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

    defaults: function()
    {
      return {
        orgUnitType: null,
        orgUnit: null,
        coeffs: {
          quantityDone: [],
          downtime: [],
          efficiency: [],
          productivity: []
        },
        downtimesByAor: [],
        downtimesByReason: []
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error("query option is required!");
      }

      this.query = options.query;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
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
      var times = Object.keys(timeToCoeffs);
      var timeDiff = -1;
      var lastTime = -1;

      if (times.length > 1)
      {
        timeDiff = Date.parse(times[1]) - Date.parse(times[0]);
      }

      Object.keys(timeToCoeffs).forEach(function(time)
      {
        var coeffs = timeToCoeffs[time];

        time = Date.parse(time);

        if (lastTime !== -1 && time - lastTime > timeDiff)
        {
          var missingPoints = (time - lastTime) / timeDiff;

          for (var i = 1; i <= missingPoints; ++i)
          {
            var missingPointTime = lastTime + timeDiff * i;

            series.quantityDone.push({x: missingPointTime, y: 0});
            series.downtime.push({x: missingPointTime, y: 0});
            series.efficiency.push({x: missingPointTime, y: 0});
            series.productivity.push({x: missingPointTime, y: 0});
          }
        }

        series.quantityDone.push({x: time, y: coeffs.quantityDone || 0});
        series.downtime.push({x: time, y: Math.round((coeffs.downtime || 0) * 100)});
        series.efficiency.push({x: time, y: Math.round((coeffs.efficiency || 0) * 100)});
        series.productivity.push({x: time, y: Math.round((coeffs.productivity || 0) * 100)});

        lastTime = time;
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
