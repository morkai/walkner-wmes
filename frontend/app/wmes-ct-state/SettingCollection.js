// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/settings/SettingCollection',
  './Setting'
], function(
  _,
  user,
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting,

    idPrefix: 'ct.',

    topicSuffix: 'ct.**',

    prepareValue: function(id, newValue)
    {
      if (/minLineWorkDuration$/.test(id))
      {
        return this.prepareFloatValue(newValue, 0, null, 0);
      }

      if (/shiftCount$/.test(id))
      {
        return this.prepareNumericValue(newValue, 1, 3, 3);
      }

      if (/availableWorkDuration$/.test(id))
      {
        return this.prepareFloatValue(newValue, 0.1, 8, 7.5);
      }

      if (/minMrpUnbalance$/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 100, 50);
      }

      if (/minMrpEfficiency$/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 100, 75);
      }

      if (/minUpphWorkDuration$/.test(id))
      {
        return this.prepareNumericValue(newValue, 0, 480, 0);
      }

      if (/Mrps$/.test(id))
      {
        return newValue.split(',').filter(function(mrp) { return !!mrp.length; });
      }
    },

    prepareFormValue: function(id, value)
    {
      return value;
    }

  });
});
