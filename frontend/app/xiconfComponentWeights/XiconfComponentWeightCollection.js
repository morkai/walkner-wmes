// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './XiconfComponentWeight'
], function(
  Collection,
  XiconfComponentWeight
) {
  'use strict';

  return Collection.extend({

    model: XiconfComponentWeight,

    rqlQuery: 'limit(-1)&sort(description)'

  });
});
