// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Program'
], function(
  Collection,
  Program
) {
  'use strict';

  return Collection.extend({

    model: Program,

    rqlQuery: 'select(name,kind)&sort(name)&limit(-1337)'

  });
});
