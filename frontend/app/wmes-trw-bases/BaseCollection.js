// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Base'
], function(
  Collection,
  Base
) {
  'use strict';

  return Collection.extend({

    model: Base,

    rqlQuery: 'sort(name)&limit(-1337)&populate(tester,(name))'

  });
});
