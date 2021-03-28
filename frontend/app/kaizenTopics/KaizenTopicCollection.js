// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenTopic'
], function(
  Collection,
  KaizenTopic
) {
  'use strict';

  return Collection.extend({

    model: KaizenTopic,

    comparator: 'position'

  });
});
