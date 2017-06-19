// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
