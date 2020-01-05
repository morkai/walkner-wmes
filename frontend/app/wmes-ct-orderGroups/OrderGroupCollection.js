// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderGroup'
], function(
  Collection,
  OrderGroup
) {
  'use strict';

  return Collection.extend({

    model: OrderGroup,

    comparator: function(a, b)
    {
      return a.get('name').localeCompare(b.get('name'), undefined, {numeric: true, ignorePunctuation: true});
    }

  });
});
