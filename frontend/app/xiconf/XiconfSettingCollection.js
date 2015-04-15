// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      if (/appVersion$/.test(id))
      {
        return this.prepareVersionValue(newValue);
      }
    },

    prepareVersionValue: function(version)
    {
      version = version.trim();

      return /^[0-9]+\.[0-9]+\.[0-9]+(?:\-[a-z0-9]+(?:\.[0-9]+)?)?/.test(version) ? version : undefined;
    }

  });
});
