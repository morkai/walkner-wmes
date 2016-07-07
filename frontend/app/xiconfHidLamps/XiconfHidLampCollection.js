// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './XiconfHidLamp'
], function(
  Collection,
  XiconfHidLamp
) {
  'use strict';

  return Collection.extend({

    model: XiconfHidLamp,

    rqlQuery: 'limit(100)&sort(description)'

  });
});
