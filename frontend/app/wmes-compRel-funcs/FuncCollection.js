// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Func'
], function(
  Collection,
  Func
) {
  'use strict';

  return Collection.extend({

    model: Func,

    getLabel: function(id)
    {
      var func = this.get(id);

      return func ? func.getLabel() : id;
    }

  });
});
