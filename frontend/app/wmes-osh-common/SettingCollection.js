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

    prepareValue: function(id, newValue)
    {

    },

    prepareFormValue: function(id, value)
    {
      return value;
    }

  });
});
