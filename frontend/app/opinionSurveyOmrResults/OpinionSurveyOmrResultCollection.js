// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    rqlQuery: 'limit(20)&status=unrecognized'

  });
});
