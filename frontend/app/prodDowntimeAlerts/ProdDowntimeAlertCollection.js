// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ProdDowntimeAlert'
], function(
  Collection,
  ProdDowntimeAlert
) {
  'use strict';

  return Collection.extend({

    model: ProdDowntimeAlert,

    rqlQuery: 'select(name)&sort(name)&limit(20)'

  });
});
