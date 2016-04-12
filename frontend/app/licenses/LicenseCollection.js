// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './License'
], function(
  Collection,
  License
) {
  'use strict';

  return Collection.extend({

    model: License,

    rqlQuery: 'limit(20)&sort(expireDate)'

  });
});
