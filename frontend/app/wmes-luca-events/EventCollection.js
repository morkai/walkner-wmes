// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Event'
], function(
  Collection,
  Event
) {
  'use strict';

  return Collection.extend({

    model: Event,

    rqlQuery: 'limit(-1337)&sort(-time)'

  });
});
