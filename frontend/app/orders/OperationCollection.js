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
