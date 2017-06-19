// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/divisions',

    clientUrlRoot: '#opinionSurveyDivisions',

    topicPrefix: 'opinionSurveys.divisions',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyDivisions',

    labelAttribute: 'short'

  });
});
