// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model',
  '../opinionSurveys/dictionaries',
  '../opinionSurveys/OpinionSurvey',
  'app/core/templates/userInfo'
], function(
  time,
  Model,
  dictionaries,
  OpinionSurvey,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/responses',

    clientUrlRoot: '#opinionSurveyResponses',

    topicPrefix: 'opinionSurveys.responses',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyResponses',

    getLabel: function()
    {
      return null;
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

      var employer = dictionaries.employers.get(obj.employer);
      var superior = survey.cacheMaps.superiors[obj.superior];
      var division = dictionaries.divisions.get(obj.division);

      obj.survey = survey.get('label') || survey.id;
      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = renderUserInfo({userInfo: obj.creator});
      obj.employer = employer ? employer.get('short') : (obj.employer || '?');
      obj.superior = superior ? superior.short : (obj.superior || '?');
      obj.division = division ? division.get('short') : (obj.division || '?');
      obj.answers = obj.answers.map(function(answer)
      {
        return {
          question: survey.cacheMaps.questions[answer.question],
          answer: answer.answer
        };
      });

      return obj;
    }

  });
});
