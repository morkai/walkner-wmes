// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../settings/SettingCollection',
  './KaizenSetting'
], function(
  _,
  $,
  SettingCollection,
  KaizenSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: KaizenSetting,

    topicSuffix: 'kaizen.**',

    getValue: function(suffix)
    {
      var setting = this.get('kaizen.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/fm24.(subject|message)$/.test(id))
      {
        return newValue || '';
      }
    }

  });
});
