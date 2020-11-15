// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Employment'
], function(
  Collection,
  Employment
) {
  'use strict';

  return Collection.extend({

    model: Employment,

    rqlQuery: 'sort(-_id)&limit(-1337)'

  });
});
