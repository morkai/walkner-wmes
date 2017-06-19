// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/SettingCollection',
  './MorSetting'
], function(
  SettingCollection,
  MorSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: MorSetting,

    topicSuffix: 'mor.**',

    getValue: function(suffix)
    {
      var setting = this.get('mor.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/prodFunctions$/i.test(id))
      {
        return newValue.split(',').filter(function(p) { return !!p.length; });
      }
    }

  });
});
