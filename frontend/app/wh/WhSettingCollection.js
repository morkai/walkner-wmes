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

  var NUMERIC_SETTINGS_RE = new RegExp([
    'maxSetSize',
    'minSetDuration',
    'maxSetDuration',
    'maxSetDifference',
    'groupDuration',
    'groupExtraItems'
  ].join('|'));

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
      if (NUMERIC_SETTINGS_RE.test(id))
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
