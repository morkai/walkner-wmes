// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiStandard'
], function(
  Collection,
  QiStandard
) {
  'use strict';

  return Collection.extend({

    model: QiStandard,

    rqlQuery: 'sort(name)'

  });
});
