// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OpinionSurveyEmployer'
], function(
  Collection,
  OpinionSurveyEmployer
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyEmployer

  });
});
