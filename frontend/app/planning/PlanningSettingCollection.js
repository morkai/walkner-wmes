// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../user',
  '../settings/SettingCollection',
  './PlanningSetting'
], function(
  $,
  user,
  SettingCollection,
  PlanningSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: PlanningSetting,

    topicSuffix: 'planning.**',

    parse: function(res)
    {
      if (res.totalCount || res.collection)
      {
        return res.collection || [];
      }

      if (!res.global)
      {
        return [];
      }

      return Object.keys(res.global).map(function(k)
      {
        return {
          _id: 'planning.' + k,
          value: res.global[k]
        };
      });
    },

    getValue: function(suffix)
    {
      var setting = this.get('planning.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/wh.groupDuration$/.test(id))
      {
        newValue = Math.round(parseInt(newValue, 10));

        if (isNaN(newValue) || newValue < 0)
        {
          return 0;
        }

        return newValue;
      }
    },

    getWhGroupDuration: function()
    {
      return Math.min(24, Math.max(1, this.getValue('wh.groupDuration') || 4));
    }

  });
});
