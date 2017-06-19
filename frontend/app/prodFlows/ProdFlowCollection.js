// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProdFlow'
], function(
  Collection,
  ProdFlow
) {
  'use strict';

  return Collection.extend({

    model: ProdFlow,

    rqlQuery: 'select(mrpController,name,deactivatedAt)&sort(name)',

    comparator: 'name'

  });
});
