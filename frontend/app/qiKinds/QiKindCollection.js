// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiKind'
], function(
  Collection,
  QiKind
) {
  'use strict';

  return Collection.extend({

    model: QiKind,

    rqlQuery: 'sort(name)'

  });
});
