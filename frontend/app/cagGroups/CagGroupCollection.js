// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './CagGroup'
], function(
  Collection,
  CagGroup
) {
  'use strict';

  return Collection.extend({

    model: CagGroup,

    rqlQuery: 'sort(name)'

  });
});
