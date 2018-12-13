// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Category'
], function(
  Collection,
  Category
) {
  'use strict';

  return Collection.extend({

    model: Category,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
