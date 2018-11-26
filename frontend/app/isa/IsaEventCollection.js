// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './IsaEvent'
], function(
  Collection,
  IsaEvent
) {
  'use strict';

  return Collection.extend({

    model: IsaEvent,

    rqlQuery: 'sort(-time)&limit(-1337)'

  });
});
