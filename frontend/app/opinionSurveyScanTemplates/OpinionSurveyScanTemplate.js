// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  '../opinionSurveys/dictionaries',
  '../opinionSurveys/OpinionSurvey'
], function(
  Model,
  dictionaries,
  OpinionSurvey
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/scanTemplates',

    clientUrlRoot: '#opinionSurveyScanTemplates',

    topicPrefix: 'opinionSurveys.scanTemplates',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyScanTemplates',

    labelAttribute: 'name',

    defaults: {
      pageNumber: 1,
      dp: 1,
      minimumDistance: 0,
      cannyThreshold: 200,
      circleAccumulatorThreshold: 25,
      minimumRadius: 0,
      maximumRadius: 0,
      filledThreshold: 230,
      markedThreshold: 40
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(survey)';
    },

    getSurveyId: function()
    {
      var survey = this.get('survey');

      if (typeof survey !== 'string')
      {
        survey = survey ? (survey._id || survey.id) : null;
      }

      return survey;
    },

    serialize: function(survey)
    {
      var obj = this.toJSON();

      if (!survey)
      {
        survey = new OpinionSurvey(obj.survey._id ? obj.survey : {_id: obj.survey});
      }

      if (!survey.cacheMaps)
      {
        survey.buildCacheMaps();
      }

      obj.survey = survey.get('label') || survey.id;

      return obj;
    }

  });
});
