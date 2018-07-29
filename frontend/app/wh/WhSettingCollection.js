// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../user',
  '../settings/SettingCollection',
  './WhSetting'
], function(
  $,
  user,
  SettingCollection,
  WhSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: WhSetting,

    topicSuffix: 'wh.**',

    getValue: function(suffix)
    {
      var setting = this.get('wh.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/group(Duration|ExtraItems)/.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 0)
        {
          return 0;
        }

        return newValue;
      }

      if (/ignoredMrps/.test(id))
      {
        return newValue.split(',').filter(function(mrp) { return !!mrp.length; });
      }
    }

  });
});
