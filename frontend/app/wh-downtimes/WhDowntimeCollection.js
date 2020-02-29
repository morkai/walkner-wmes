// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhDowntime'
], function(
  Collection,
  WhDowntime
) {
  'use strict';

  return Collection.extend({

    model: WhDowntime,

    rqlQuery: 'sort(-startedAt)&limit(-1337)'

  });
});
