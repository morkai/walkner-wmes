// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './XiconfProgram'
], function(
  Collection,
  XiconfProgram
) {
  'use strict';

  return Collection.extend({

    model: XiconfProgram,

    rqlQuery: 'select(name,type,prodLines,updatedAt,steps)&limit(15)&sort(name)'

  });
});
