// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './QiResult'
], function(
  Collection,
  QiResult
) {
  'use strict';

  return Collection.extend({

    model: QiResult,

    rqlQuery: 'limit(20)&sort(-inspectedAt)',

    hasAnyNokResult: function()
    {
      return this.some(function(result) { return !result.get('ok'); });
    }

  });
});
