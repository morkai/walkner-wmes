// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Tool'
], function(
  Collection,
  Tool
) {
  'use strict';

  return Collection.extend({

    model: Tool,

    rqlQuery: 'exclude(changes)&limit(-1337)&sort(nextDate)&status=in-use'

  });
});
