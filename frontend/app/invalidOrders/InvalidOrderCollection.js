// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './InvalidOrder'
], function(
  Collection,
  InvalidOrder
) {
  'use strict';

  return Collection.extend({

    model: InvalidOrder,

    rqlQuery: 'status=invalid&sort(-updatedAt,_id)&limit(15)',

    initialize: function()
    {
      this.selected = {};
    },

    toggleSelection: function(id, state)
    {
      if (id === null)
      {
        this.selected = {};

        this.trigger('selected', id, false);

        return;
      }

      if (state === undefined)
      {
        if (this.selected[id])
        {
          delete this.selected[id];
        }
        else
        {
          this.selected[id] = true;
        }
      }
      else if (state)
      {
        this.selected[id] = true;
      }
      else
      {
        delete this.selected[id];
      }

      this.trigger('selected', id, !!this.selected[id]);
    }

  });
});
