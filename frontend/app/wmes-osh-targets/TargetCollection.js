// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Target'
], function(
  Collection,
  Target
) {
  'use strict';

  return Collection.extend({

    model: Target,

    rqlQuery: 'sort(-_id)&limit(-1337)'

  });
});
