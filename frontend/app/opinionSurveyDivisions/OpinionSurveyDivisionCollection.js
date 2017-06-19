// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OpinionSurveyDivision'
], function(
  Collection,
  OpinionSurveyDivision
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyDivision

  });
});
