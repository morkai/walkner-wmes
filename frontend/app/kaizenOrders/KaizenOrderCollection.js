// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './KaizenOrder'
], function(
  time,
  Collection,
  KaizenOrder
) {
  'use strict';

  return Collection.extend({

    model: KaizenOrder,

    rowHeight: 1,

    rqlQuery: 'exclude(changes)&sort(-eventDate)&limit(-1337)'

  });
});
