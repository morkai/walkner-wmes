// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    labelAttribute: 'short',

  });
});
