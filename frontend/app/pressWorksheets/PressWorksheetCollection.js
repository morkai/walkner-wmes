define([
  '../core/Collection',
  './PressWorksheet'
], function(
  Collection,
  PressWorksheet
) {
  'use strict';

  return Collection.extend({

    model: PressWorksheet,

    rqlQuery: 'exclude(orders,operators)&sort(-date)&limit(15)'

  });
});
