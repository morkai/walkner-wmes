// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/SettingCollection',
  './QiSetting'
], function(
  SettingCollection,
  QiSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: QiSetting,

    topicSuffix: 'qi.**',

    getValue: function(suffix)
    {
      var setting = this.get('qi.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      return parseInt(newValue, 10) || 0;
    },

    getMaxNokPerDay: function()
    {
      return this.getValue('maxNokPerDay') || 0;
    }

  });
});
