// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenRisk'
], function(
  Collection,
  KaizenRisk
) {
  'use strict';

  return Collection.extend({

    model: KaizenRisk,

    comparator: 'position'

  });
});
