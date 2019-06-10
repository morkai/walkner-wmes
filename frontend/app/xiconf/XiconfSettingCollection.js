// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../settings/SettingCollection',
  './XiconfSetting'
], function(
  $,
  SettingCollection,
  XiconfSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: XiconfSetting,

    topicSuffix: 'xiconf.**',

    getValue: function(suffix)
    {
      var setting = this.get('xiconf.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (typeof newValue === 'boolean')
      {
        return newValue;
      }

      if (/appVersion$/.test(id))
      {
        return this.prepareVersionValue(newValue);
      }

      if (/delay$/.test(id))
      {
        newValue = parseInt(newValue, 10);

        return isNaN(newValue)
          ? 15
          : newValue < 1
            ? 1
            : newValue > 30
              ? 30
              : newValue;
      }

      if (/(Filter|componentPatterns)$/.test(id))
      {
        return newValue;
      }
    },

    prepareVersionValue: function(version)
    {
      version = version.trim();

      return /^[0-9]+\.[0-9]+\.[0-9]+(?:\-[a-z0-9]+(?:\.[0-9]+)?)?/.test(version) ? version : undefined;
    }

  });
});
