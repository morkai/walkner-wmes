// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './DpCode'
], function(
  Collection,
  Paint
) {
  'use strict';

  return Collection.extend({

    model: Paint,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
