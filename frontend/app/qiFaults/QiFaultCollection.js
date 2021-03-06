// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiFault'
], function(
  Collection,
  QiFault
) {
  'use strict';

  return Collection.extend({

    model: QiFault,

    rqlQuery: 'sort(_id)',

    comparator: '_id'

  });
});
