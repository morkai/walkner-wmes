// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'paintShop',

    defaults: function()
    {
      return {
        counter: 1,
        totalCount: window.screen.availWidth,
        collection: []
      };
    },

    url: function()
    {
      return '/paintShop/load/recent?counter=' + this.get('counter') + '&limit=' + this.get('totalCount');
    },

    update: function(items)
    {
      var totalCount = this.get('totalCount');
      var collection = this.get('collection');
      var added = items.map(function(item) { return Math.round(item.d / 1000); });

      collection.push.apply(collection, added);

      var removed = collection.length - totalCount;

      if (removed)
      {
        collection.splice(0, removed);
      }

      this.trigger('update', {
        added: added,
        removed: removed
      });
    }

  });
});
