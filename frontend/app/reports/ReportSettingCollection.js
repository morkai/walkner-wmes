// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../settings/SettingCollection',
  './util/prepareDateRange',
  './ReportSetting'
], function(
  user,
  SettingCollection,
  prepareDateRange,
  ReportSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ReportSetting,

    topicSuffix: 'reports.**',

    getValue: function(suffix, defaultValue)
    {
      var setting = this.get('reports.' + suffix);

      return setting ? setting.getValue() : (defaultValue === undefined ? null : defaultValue);
    },

    getColor: function(metric, opacity)
    {
      var hex = this.getValue(metric + '.color') || '#000000';

      if (!opacity)
      {
        return hex;
      }

      var matches = hex.match(/^#(.{2})(.{2})(.{2})$/);

      if (!matches)
      {
        return hex;
      }

      return 'rgba('
        + parseInt(matches[1], 16) + ','
        + parseInt(matches[2], 16) + ','
        + parseInt(matches[3], 16) + ','
        + opacity + ')';
    },

    getReference: function(metric, orgUnitId)
    {
      return this.getValue(metric + '.' + orgUnitId) || 0;
    },

    getCoeff: function(metric)
    {
      var coeff = this.getValue(metric + '.coeff');

      return coeff > 0 ? coeff : 0;
    },

    getDefaultDowntimeAors: function()
    {
      var aors = this.getValue('downtimesInAors.aors') || 'own';

      if (aors === 'own')
      {
        return user.data.aors || [];
      }

      return aors.split(',').filter(function(aorId) { return aorId.length > 0; });
    },

    getDefaultDowntimeStatuses: function()
    {
      return (this.getValue('downtimesInAors.statuses') || 'confirmed').split(',');
    },

    getDateRange: function(id)
    {
      var dateRange = prepareDateRange(this.getValue(id) || 'currentWeek');

      return {
        from: dateRange.fromMoment.format('YYYY-MM-DD'),
        to: dateRange.toMoment.format('YYYY-MM-DD'),
        interval: dateRange.interval
      };
    },

    prepareValue: function(id, newValue)
    {
      if (/color/i.test(id))
      {
        return this.prepareColorValue(newValue);
      }

      if (/coeff/i.test(id))
      {
        return this.prepareCoeffValue(newValue);
      }

      if (/(id|prodTask|specificAor)$/i.test(id))
      {
        return this.prepareObjectIdValue(newValue);
      }

      if (/DowntimeReasons$/.test(id))
      {
        return newValue === '' ? [] : newValue.split(',');
      }

      if (/downtimesInAors.aors$/.test(id))
      {
        return this.prepareDowntimeAorsValue(newValue);
      }

      if (/downtimesInAors.statuses$/.test(id))
      {
        return this.prepareDowntimeStatusesValue(newValue);
      }

      if (/(interval|dateRange)$/i.test(id))
      {
        return newValue;
      }

      if (/lean/.test(id))
      {
        return this.prepareLeanValue(id, newValue);
      }

      if (/\.clip\./.test(id))
      {
        return this.prepareClipValue(id, newValue);
      }

      if (/\.rearm\./.test(id))
      {
        return this.prepareRearmValue(id, newValue);
      }

      return this.prepare100PercentValue(newValue);
    },

    prepareLeanValue: function(id, newValue)
    {
      if (/(ProdTasks|ProdFlows)$/.test(id))
      {
        return newValue === '' ? [] : newValue.split(',');
      }

      if (/(Den|Threshold|Plan)$/.test(id))
      {
        return this.prepareCoeffValue(newValue);
      }

      return newValue;
    },

    prepareClipValue: function(id, newValue)
    {
      if (/PropertyOffset$/.test(id))
      {
        return parseInt(newValue, 10) || 0;
      }

      if (/(Property|FilterMode)/.test(id) && typeof newValue === 'string')
      {
        return newValue;
      }

      if (/dataHoursOffset/.test(id))
      {
        return newValue
          .split('\n')
          .map(function(line)
          {
            var parts = line.split(':');
            var hours = parseInt(parts[0], 10);
            var mrps = (parts[1] || '')
              .toUpperCase()
              .replace(/[^A-Z0-9*,]+/g, '')
              .split(',')
              .filter(function(mrp) { return mrp.length > 0; });

            return {
              hours: hours,
              mrps: mrps
            };
          })
          .filter(function(d)
          {
            return d.hours >= -120 && d.hours <= 120 && d.mrps.length > 0;
          })
          .map(function(d)
          {
            return d.hours + ': ' + d.mrps.join(', ');
          })
          .join('\n');
      }

      if (/ignoreDone/.test(id))
      {
        return !!newValue;
      }

      if (/(Mrps|Statuses|DelayReasons)/.test(id))
      {
        return newValue.split(',').filter(function(v) { return v.length > 1; });
      }

      return undefined;
    },

    prepareRearmValue: function(id, newValue)
    {
      if (/(downtime|metric)Columns$/.test(id))
      {
        return Array.isArray(newValue) ? newValue : [];
      }
    },

    prepare100PercentValue: function(value)
    {
      if (value === '')
      {
        return 0;
      }

      value = parseInt(value, 10);

      if (isNaN(value))
      {
        return undefined;
      }

      if (value < 0)
      {
        return 0;
      }

      if (value > 100)
      {
        return 100;
      }

      return value;
    },

    prepareCoeffValue: function(value)
    {
      if (value === '')
      {
        return 0;
      }

      value = parseFloat(value);

      if (isNaN(value))
      {
        return undefined;
      }

      if (value < 0)
      {
        return 0;
      }

      return Math.round(value * 10000) / 10000;
    },

    prepareColorValue: function(value)
    {
      value = value.toLowerCase();

      if (/^#[a-f0-9]{6}$/.test(value))
      {
        return value;
      }

      return undefined;
    },

    prepareDowntimeAorsValue: function(value)
    {
      return value === 'own'
        ? value
        : value.split(',').filter(function(aorId) { return /^[a-f0-9]{24}$/.test(aorId); }).join(',');
    },

    prepareDowntimeStatusesValue: function(value)
    {
      var statuses = (Array.isArray(value) ? value : value.split(',')).filter(function(status)
      {
        return status === 'undecided' || status === 'rejected' || status === 'confirmed';
      });

      return statuses.length ? statuses.join(',') : 'confirmed';
    }

  });
});
