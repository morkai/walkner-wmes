// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../settings/SettingCollection',
  './FteSetting'
], function(
  $,
  SettingCollection,
  FteSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: FteSetting,

    topicSuffix: 'fte.**',

    getValue: function(suffix)
    {
      var setting = this.get('fte.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      return newValue;
    }

  });
});
