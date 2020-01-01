// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './LineState'
], function(
  Collection,
  LineState
) {
  'use strict';

  return Collection.extend({

    model: LineState,

    paginate: false,

    comparator: function(a, b)
    {
      return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
    },

    parse: function(res)
    {
      return res;
    },

    update: function(message)
    {
      var lineState = this.get(message.line);

      if (lineState)
      {
        lineState.update(message);
      }
    }

  });
});
