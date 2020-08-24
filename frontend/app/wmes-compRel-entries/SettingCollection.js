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

    idPrefix: 'compRel.',

    topicSuffix: 'compRel.**',

    prepareValue: function(id, newValue)
    {
      if (/Functions$/.test(id))
      {
        return Array.isArray(newValue) ? newValue : typeof newValue === 'string' ? newValue.split(',') : [];
      }
    },

    prepareFormValue: function(id, value)
    {
      return value;
    },

    canChangeCategory: function()
    {
      return _.includes(this.getValue('categoryFunctions'), user.data.prodFunction);
    }

  });
});
