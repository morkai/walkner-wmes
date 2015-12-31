// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OpinionSurveyOmrResult'
], function(
  Collection,
  OpinionSurveyOmrResult
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyOmrResult,

    rqlQuery: 'limit(15)&status=unrecognized'

  });
});
