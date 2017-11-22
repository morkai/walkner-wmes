// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../core/Collection',
  './PaintShopDropZone'
], function(
  $,
  Collection,
  PaintShopDropZone
) {
  'use strict';

  return Collection.extend({

    model: PaintShopDropZone,

    paginate: false,

    initialize: function(models, options)
    {
      this.date = options && options.date;
    },

    url: function()
    {
      return '/paintShop/dropZones?' + (this.date ? ('_id.date=' + this.date) : '');
    },

    parse: function(res)
    {
      return (res.collection || []).map(PaintShopDropZone.parse);
    },

    setDate: function(newDate)
    {
      this.date = newDate;
    },

    toggle: function(mrp)
    {
      return this.update(mrp, !this.getState(mrp));
    },

    update: function(mrp, newState)
    {
      return $.ajax({
        method: 'POST',
        url: '/paintShop/dropZones/' + this.date + '/' + mrp,
        data: JSON.stringify({
          state: newState
        })
      });
    },

    updated: function(message)
    {
      if (this.date && message._id.date !== this.date)
      {
        return;
      }

      var id = PaintShopDropZone.id(message);
      var dropZone = this.get(id);

      if (dropZone)
      {
        dropZone.set('state', message.state);
      }
      else
      {
        this.add(PaintShopDropZone.parse(message));
      }

      this.trigger('updated', this.get(id));
    },

    getState: function(mrp)
    {
      var dropZone = this.get(this.date + '~' + mrp);

      return dropZone ? dropZone.get('state') : false;
    }

  }, {

    forDate: function(date)
    {
      return new this(null, {date: date});
    }

  });
});
