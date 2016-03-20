// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './IsaPalletKind'
], function(
  Collection,
  IsaPalletKind
) {
  'use strict';

  return Collection.extend({

    model: IsaPalletKind,

    rqlQuery: 'sort(shortName)',

    comparator: 'shortName'

  });
});
