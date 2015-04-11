// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../settings/SettingCollection',
  './ReportSetting'
], function(
  SettingCollection,
  ReportSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ReportSetting,

    topicSuffix: 'reports.**',

    getValue: function(suffix)
    {
      var setting = this.get('reports.' + suffix);

      return setting ? setting.getValue() : null;
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

      if (/(id|prodTask)$/.test(id))
      {
        return this.prepareObjectIdValue(newValue);
      }

      return this.prepare100PercentValue(newValue);
    },

    prepareObjectIdValue: function(value)
    {
      if (value === '')
      {
        return null;
      }

      return (/^[a-f0-9]{24}$/).test(value) ? value : undefined;
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
    }

  });
});
