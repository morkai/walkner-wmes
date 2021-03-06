// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Division'
], function(
  Collection,
  Division
) {
  'use strict';

  return Collection.extend({

    model: Division

  });
});
