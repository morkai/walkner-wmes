// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OshAudit'
], function(
  Collection,
  OshAudit
) {
  'use strict';

  return Collection.extend({

    model: OshAudit,

    rqlQuery: 'limit(-1337)&sort(-date)'

  });
});
