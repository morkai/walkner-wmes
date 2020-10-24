// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Action'
], function(
  Collection,
  Action
) {
  'use strict';

  return Collection.extend({

    model: Action,

    rqlQuery: 'exclude(changes)&sort(-createdAt)&limit(-1337)'

  });
});
