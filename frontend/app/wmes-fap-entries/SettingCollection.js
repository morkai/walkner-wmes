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

    topicSuffix: 'fap.**',

    getValue: function(suffix)
    {
      var setting = this.get('fap.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/pendingFunctions/.test(id))
      {
        return Array.isArray(newValue) ? newValue : typeof newValue === 'string' ? newValue.split(',') : [];
      }
    },

    prepareFormValue: function(id, value)
    {
      return value;
    }

  });
});
