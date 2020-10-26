// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Company'
], function(
  Collection,
  Company
) {
  'use strict';

  return Collection.extend({

    model: Company

  });
});
