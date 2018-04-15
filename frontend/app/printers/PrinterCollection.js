// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Printer'
], function(
  Collection,
  Printer
) {
  'use strict';

  return Collection.extend({

    model: Printer

  });
});
