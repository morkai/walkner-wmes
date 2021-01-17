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

    rqlQuery: 'limit(-1337)&sort(name)',

    initialize: function(models, options)
    {
      if (options && options.sortByName)
      {
        this.comparator = this.sortByName;
      }
    },

    sortByName: function(a, b)
    {
      if (a.id === '000000000000000000000000')
      {
        return -1;
      }

      if (b.id === '000000000000000000000000')
      {
        return 1;
      }

      return a.get('name').localeCompare(b.get('name'));
    }

  });
});
