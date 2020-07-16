// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './DpFamily'
], function(
  Collection,
  DpFamily
) {
  'use strict';

  return Collection.extend({

    model: DpFamily,

    rqlQuery: 'limit(-1337)&sort(paintFamily,_id)',

    comparator: 'paintFamily'

  });
});
