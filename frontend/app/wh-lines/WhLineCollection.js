// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhLine'
], function(
  Collection,
  getShiftStartInfo,
  WhLine
) {
  'use strict';

  return Collection.extend({

    model: WhLine,

    rqlQuery: 'sort(_id)&limit(0)',

    comparator: function(a, b)
    {
      return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
    }

  });
});
