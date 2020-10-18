// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './ActivityKind'
], function(
  Collection,
  ActivityKind
) {
  'use strict';

  return Collection.extend({

    model: ActivityKind,

    sort: function(a, b)
    {
      return a.get('longName').localeCompare(b.get('longName'));
    }

  });
});
