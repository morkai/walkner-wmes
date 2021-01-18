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
      if (/(obsPerDept|minEngagement)/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 100, 0);
      }

      if (/minObsCards/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 1000, 0);
      }
    },

    prepareFormValue: function(id, value)
    {
      return value;
    }

  });
});
