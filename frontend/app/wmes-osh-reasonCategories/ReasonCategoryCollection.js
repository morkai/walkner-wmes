// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './ReasonCategory'
], function(
  Collection,
  ReasonCategory
) {
  'use strict';

  return Collection.extend({

    model: ReasonCategory,

    sort: function(a, b)
    {
      return a.get('longName').localeCompare(b.get('longName'));
    }

  });
});
