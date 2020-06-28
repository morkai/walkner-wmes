// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './PsIgnoredComponent'
], function(
  Collection,
  PsIgnoredComponent
) {
  'use strict';

  return Collection.extend({

    model: PsIgnoredComponent,

    rqlQuery: 'sort(_id)&limit(-1337)'

  });
});
