// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiErrorCategory'
], function(
  Collection,
  QiErrorCategory
) {
  'use strict';

  return Collection.extend({

    model: QiErrorCategory

  });
});
