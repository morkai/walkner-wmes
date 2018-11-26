// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenOrder'
], function(
  Collection,
  KaizenOrder
) {
  'use strict';

  return Collection.extend({

    model: KaizenOrder,

    rowHeight: 2,

    rqlQuery: 'exclude(changes)&limit(20)&sort(-eventDate)'

  });
});
