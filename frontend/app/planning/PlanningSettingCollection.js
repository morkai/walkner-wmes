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
      return 4;
    }

  });
});
