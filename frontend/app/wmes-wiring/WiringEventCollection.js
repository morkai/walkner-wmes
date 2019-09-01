// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WiringEvent'
], function(
  Collection,
  WiringEvent
) {
  'use strict';

  return Collection.extend({

    model: WiringEvent,

    rqlQuery: 'sort(-time)&limit(0)'

  }, {

    forOrder: function(order)
    {
      return new this(null, {rqlQuery: 'sort(time)&limit(0)&order=' + order});
    }

  });
});
