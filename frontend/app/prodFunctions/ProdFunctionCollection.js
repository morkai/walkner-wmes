// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProdFunction'
], function(
  Collection,
  ProdFunction
) {
  'use strict';

  return Collection.extend({

    model: ProdFunction,

    rqlQuery: 'sort(label)',

    comparator: 'label'

  });
});
