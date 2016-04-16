// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiFault'
], function(
  Collection,
  QiFault
) {
  'use strict';

  return Collection.extend({

    model: QiFault

  });
});
