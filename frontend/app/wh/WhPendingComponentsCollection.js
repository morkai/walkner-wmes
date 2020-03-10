// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './WhPendingComponents'
], function(
  Collection,
  WhPendingComponents
) {
  'use strict';

  function key(m)
  {
    return Date.parse(m.get('date')) + ':' + m.get('set');
  }

  return Collection.extend({

    model: WhPendingComponents,

    paginate: false,

    initialize: function()
    {
      var c = this;

      c.cached = {};

      c.on('reset', function()
      {
        c.forEach(function(m) { c.cached[key(m)] = true; });
      });

      c.on('add', function(m) { c.cached[key(m)] = true; });

      c.on('remove', function(m) { delete c.cached[key(m)]; });
    },

    isPendingSetCart: function(setCart)
    {
      return this.cached[key(setCart)] === true;
    }

  });
});
