// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhRedirReason'
], function(
  Collection,
  WhRedirReason
) {
  'use strict';

  return Collection.extend({

    model: WhRedirReason,

    comparator: function(a, b)
    {
      return a.get('label').localeCompare(b.get('label'), undefined, {ignorePunctuation: true});
    }

  });
});
