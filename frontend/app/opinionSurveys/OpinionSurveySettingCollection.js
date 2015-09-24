// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../settings/SettingCollection',
  './OpinionSurveySetting'
], function(
  SettingCollection,
  OpinionSurveySetting
) {
  'use strict';

  return SettingCollection.extend({

    model: OpinionSurveySetting,

    topicSuffix: 'opinionSurveys.**',

    getValue: function(suffix)
    {
      var setting = this.get('opinionSurveys.' + suffix);

      return setting ? setting.getValue() : null;
    },

    prepareValue: function(id, newValue)
    {
      return parseInt(newValue, 10) || 0;
    },

    getPositiveAnswersReference: function()
    {
      return this.getValue('positiveAnswersReference') || 0;
    },

    getResponseReference: function()
    {
      return this.getValue('responseReference') || 0;
    }

  });
});
