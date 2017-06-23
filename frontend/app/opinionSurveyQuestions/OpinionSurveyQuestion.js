// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/questions',

    clientUrlRoot: '#opinionSurveyQuestions',

    topicPrefix: 'opinionSurveys.questions',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyQuestions',

    labelAttribute: 'short'

  });
});
