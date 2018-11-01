// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/SettingCollection',
  './HelpSetting'
], function(
  SettingCollection,
  HelpSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: HelpSetting,

    topicSuffix: 'help.**',

    getValue: function(suffix)
    {
      var setting = this.get('help.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/rootFileId/.test(id))
      {
        return /^[A-Za-z0-9]+$/.test(newValue) ? newValue : '';
      }
    }

  });
});
