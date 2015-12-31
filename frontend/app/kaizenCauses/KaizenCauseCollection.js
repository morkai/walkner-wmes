// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenCause'
], function(
  Collection,
  KaizenCause
) {
  'use strict';

  return Collection.extend({

    model: KaizenCause,

    comparator: 'position'

  });
});
