// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './XData'
], function(
  Collection,
  XData
) {
  'use strict';

  return Collection.extend({

    model: XData,

    rqlQuery: 'sort(-createdAt)'

  });
});
