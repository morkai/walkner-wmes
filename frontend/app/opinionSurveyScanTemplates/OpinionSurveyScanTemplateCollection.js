// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OpinionSurveyScanTemplate'
], function(
  Collection,
  OpinionSurveyScanTemplate
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyScanTemplate,

    rqlQuery: 'limit(-1)&sort(-survey)'

  });
});
