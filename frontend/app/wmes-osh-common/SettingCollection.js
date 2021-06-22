// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/SettingCollection',
  './Setting'
], function(
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting,

    idPrefix: 'osh.',

    topicSuffix: 'osh.**',

    prepareValue: function(id, newValue) // eslint-disable-line no-unused-vars
    {
      if (/ignoredUsers$/.test(id))
      {
        return Array.isArray(newValue) ? newValue : [];
      }

      if (/rewards/.test(id))
      {
        return Math.round(this.prepareFloatValue(newValue, 0, 1000, 0) * 100) / 100;
      }
    },

    prepareFormValue: function(id, value)
    {
      if (/ignoredUsers$/.test(id))
      {
        return value.map(u => u.id).join(',');
      }

      return value;
    }

  });
});
