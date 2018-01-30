// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './PaintShopSetting'
], function(
  _,
  SettingCollection,
  PaintShopSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: PaintShopSetting,

    topicSuffix: 'paintShop.**',

    getValue: function(suffix)
    {
      var setting = this.get('paintShop.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      if (/load.statuses$/.test(id))
      {
        return newValue;
      }
    },

    getLoadStatus: function(d)
    {
      return _.find(
        this.getValue('load.statuses'),
        function(status) { return d >= status.from && (!status.to || d < status.to); }
      ) || {
        from: 0,
        to: 0,
        icon: 'question',
        color: '#0AF'
      };
    }

  });
});
