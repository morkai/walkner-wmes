// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../settings/SettingCollection',
  './FactoryLayoutSetting'
], function(
  $,
  SettingCollection,
  FactoryLayoutSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: FactoryLayoutSetting,

    topicSuffix: 'factoryLayout.**',

    isBlacklisted: function(orgUnitType, orgUnitId)
    {
      var blacklist = this.getValue('blacklist.' + orgUnitType);

      return Array.isArray(blacklist) && blacklist.indexOf(orgUnitId) !== -1;
    },

    getValue: function(suffix)
    {
      var setting = this.get('factoryLayout.' + suffix);

      return setting ? setting.getValue() : null;
    },

    update: function(id, newValue)
    {
      newValue = this.prepareValue(id, newValue.trim());

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
      if (/blacklist/.test(id))
      {
        return this.prepareBlacklistValue(newValue);
      }

      newValue = parseInt(newValue, 10);

      return isNaN(newValue) ? undefined : newValue;
    },

    prepareBlacklistValue: function(value)
    {
      if (typeof value === 'string')
      {
        value = value.split(',');
      }
      else if (!Array.isArray(value))
      {
        value = [];
      }

      return value.filter(function(item)
      {
        return typeof item === 'string' && item.length;
      });
    }

  });
});
