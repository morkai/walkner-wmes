// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Kind'
], function(
  Collection,
  Kind
) {
  'use strict';

  return Collection.extend({

    model: Kind

  });
});
