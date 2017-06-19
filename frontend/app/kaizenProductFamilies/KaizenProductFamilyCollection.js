// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenProductFamily'
], function(
  Collection,
  KaizenProductFamily
) {
  'use strict';

  return Collection.extend({

    model: KaizenProductFamily,

    comparator: 'position'

  });
});
