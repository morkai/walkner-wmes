// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './PfepEntry'
], function(
  time,
  Collection,
  PfepEntry
) {
  'use strict';

  return Collection.extend({

    model: PfepEntry,

    rowHeight: 1,
    theadHeight: 3,

    rqlQuery: 'sort(-rid)&limit(-1337)'

  });
});
