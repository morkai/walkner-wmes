// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Brigade'
], function(
  Collection,
  Brigade
) {
  'use strict';

  return Collection.extend({

    model: Brigade,

    rqlQuery: 'sort(-_id)&limit(-1337)'

  });
});
