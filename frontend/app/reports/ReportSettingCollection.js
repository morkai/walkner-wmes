// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../settings/SettingCollection',
  './ReportSetting'
], function(
  $,
  SettingCollection,
  ReportSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: ReportSetting,

    topicPrefix: 'reports.**',

    getColor: function(metric, opacity)
    {
      var setting = this.get('reports.' + metric + '.color');
      var color = setting ? setting.get('value') : null;
      var hex = color || '#000000';

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
      var setting = this.get('reports.' + metric + '.' + orgUnitId);

      return setting ? setting.getValue() : 0;
    },

    update: function(id, newValue)
    {
      newValue = this.prepareValue(id, newValue);

      if (newValue === undefined)
      {
        return $.Deferred().reject().promise();
      }

      var setting = this.get(id);

      if (setting)
      {
        if (setting.getValue() === newValue)
        {
          return $.Deferred().resolve().promise();
        }
      }
      else
      {
        this.add({
          _id: id,
          value: null
        });

        setting = this.get(id);
      }

      return setting.save({value: newValue});
    },

    prepareValue: function(id, newValue)
    {
      if (/color/i.test(id))
      {
        return this.prepareColorValue(newValue);
      }

      return this.prepare100PercentValue(newValue);
    },

    prepare100PercentValue: function(value)
    {
      if (value.trim() === '')
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

    prepareColorValue: function(value)
    {
      value = value.trim().toLowerCase();

      if (/^#[a-f0-9]{6}$/.test(value))
      {
        return value;
      }

      return undefined;
    }

  });
});
