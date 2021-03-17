// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/SettingCollection',
  './FactoryLayoutSetting'
], function(
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

    getColor: function(divisionId, opacity)
    {
      var hex = this.getValue(divisionId + '.color') || '#FFFFFF';

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

    prepareValue: function(id, newValue)
    {
      if (/blacklist/.test(id))
      {
        return this.prepareBlacklistValue(newValue);
      }

      if (/color/i.test(id))
      {
        return this.prepareColorValue(newValue);
      }

      if (/qiKinds$/.test(id))
      {
        return this.prepareMultiObjectIdValue(newValue);
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
