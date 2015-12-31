// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenCategory'
], function(
  Collection,
  KaizenCategory
) {
  'use strict';

  return Collection.extend({

    model: KaizenCategory,

    comparator: 'position',

    inNearMiss: function()
    {
      return this.filter(function(m) { return m.get('inNearMiss'); });
    },

    inSuggestion: function()
    {
      return this.filter(function(m) { return m.get('inSuggestion'); });
    }

  });
});
