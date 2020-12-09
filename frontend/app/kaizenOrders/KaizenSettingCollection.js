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

      if (/superiorFuncs$/.test(id))
      {
        return newValue.split(',').filter(function(v) { return !!v; });
      }

      if (/reward/.test(id))
      {
        var v = Math.round(parseFloat(newValue) * 100) / 100;

        return v > 0 ? v : 0;
      }
    }

  });
});
