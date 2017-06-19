// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../settings/SettingCollection',
  './FteSetting'
], function(
  $,
  SettingCollection,
  FteSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: FteSetting,

    topicSuffix: 'fte.**',

    getValue: function(suffix)
    {
      var setting = this.get('fte.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      return newValue;
    }

  });
});
