// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Operation'
], function(
  Collection,
  Operation
) {
  'use strict';

  return Collection.extend({

    model: Operation

  });
});
