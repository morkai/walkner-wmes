// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenArea'
], function(
  Collection,
  KaizenArea
) {
  'use strict';

  return Collection.extend({

    model: KaizenArea,

    comparator: 'position'

  });
});
