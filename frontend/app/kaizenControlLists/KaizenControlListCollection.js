// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenControlList'
], function(
  Collection,
  KaizenControlList
) {
  'use strict';

  return Collection.extend({

    model: KaizenControlList,

    comparator: 'name'

  });
});
