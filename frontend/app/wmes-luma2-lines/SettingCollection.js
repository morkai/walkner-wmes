// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './Setting'
], function(
  _,
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting,

    topicSuffix: 'luma2.**',

    getValue: function(suffix)
    {
      var setting = this.get('luma2.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/Time$/.test(id))
      {
        return Math.min(3600, Math.max(1, parseInt(newValue, 10) || 1));
      }
    }

  });
});
