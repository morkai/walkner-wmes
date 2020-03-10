// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhPendingPackaging'
], function(
  Collection,
  WhPendingPackaging
) {
  'use strict';

  return Collection.extend({

    model: WhPendingPackaging,

    paginate: false,

    initialize: function()
    {
      var c = this;

      c.cached = {};

      c.on('reset', function()
      {
        c.cached = {};
        c.forEach(cache);
      });

      c.on('add', cache);

      c.on('remove', function(m)
      {
        m.get('setCarts').forEach(function(id)
        {
          delete c.cached[id];
        });
      });

      function cache(m)
      {
        m.get('setCarts').forEach(function(id)
        {
          c.cached[id] = true;
        });
      }
    },

    isPendingSetCart: function(setCart)
    {
      return this.cached[setCart.id] === true;
    }

  });
});
