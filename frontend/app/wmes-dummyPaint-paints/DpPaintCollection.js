// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './DpPaint'
], function(
  Collection,
  DoPaint
) {
  'use strict';

  return Collection.extend({

    model: DoPaint,

    rqlQuery: 'limit(-1337)&sort(code,family)'

  });
});
