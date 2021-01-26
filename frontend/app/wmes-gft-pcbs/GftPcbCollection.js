// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './GftPcb'
], function(
  Collection,
  GftPcb
) {
  'use strict';

  return Collection.extend({

    model: GftPcb,

    rqlQuery: 'limit(-1337)&sort(code,quantity)'

  });
});
