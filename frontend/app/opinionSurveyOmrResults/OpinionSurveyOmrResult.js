// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../time',
  '../core/Model',
  '../opinionSurveys/dictionaries',
  '../opinionSurveys/OpinionSurvey'
], function(
  t,
  time,
  Model,
  dictionaries,
  OpinionSurvey
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/omrResults',

    clientUrlRoot: '#opinionSurveyOmrResults',

    topicPrefix: 'opinionSurveys.omrResults',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyOmrResults',

    defaults: {

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
      obj.status = t(this.nlsDomain, 'status:' + obj.status);
      obj.errorCode = obj.errorCode ? t(this.nlsDomain, 'error:' + obj.errorCode) : '';
      obj.matchScore = obj.matchScore.toLocaleString();

      var startedAt = time.getMoment(obj.startedAt);
      var finishedAt = time.getMoment(obj.finishedAt);

      obj.startedAt = startedAt.format('YYYY-MM-DD, HH:mm:ss.SSS');
      obj.finishedAt = finishedAt.format('YYYY-MM-DD, HH:mm:ss.SSS');
      obj.duration = time.toString(finishedAt.diff(startedAt, 'seconds', true));

      return obj;
    }

  });
});
