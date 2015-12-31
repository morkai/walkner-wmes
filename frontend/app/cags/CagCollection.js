// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Cag'
], function(
  Collection,
  Cag
) {
  'use strict';

  return Collection.extend({

    model: Cag,

    rqlQuery: 'sort(_id)'

  });
});
