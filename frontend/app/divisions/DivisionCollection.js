// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Division'
], function(
  Collection,
  Division
) {
  'use strict';

  return Collection.extend({

    model: Division,

    rqlQuery: 'sort(_id)',

    comparator: '_id'

  });
});
