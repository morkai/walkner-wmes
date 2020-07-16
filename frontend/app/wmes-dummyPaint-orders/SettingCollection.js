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

    idPrefix: 'dummyPaint.',

    topicSuffix: 'dummyPaint.**',

    prepareValue: function(id, newValue)
    {
      if (/(nonAkzo|nonRal)/.test(id))
      {
        return Array.isArray(newValue) ? newValue : typeof newValue === 'string' ? newValue.split(/[\n,]+/) : [];
      }
    },

    prepareFormValue: function(id, value)
    {
      return Array.isArray(value) ? value.join('\n') : value;
    }

  });
});
