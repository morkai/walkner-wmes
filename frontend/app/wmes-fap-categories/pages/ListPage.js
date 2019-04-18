// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/ListPage',
  '../storage'
], function(
  _,
  bindLoadingMessage,
  ListPage,
  storage
) {
  'use strict';

  return ListPage.extend({

    baseBreadcrumb: '#fap/entries',

    columns: [
      {id: 'name', className: 'is-min'},
      {id: 'active', className: 'is-min'},
      {id: 'etoCategory', className: 'is-min'},
      {id: 'planners', className: 'is-min'},
      '-'
    ],

    destroy: function()
    {
      ListPage.prototype.destroy.apply(this, arguments);

      storage.release();
    },

    load: function(when)
    {
      return when(
        this.collection.isEmpty() ? this.collection.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      ListPage.prototype.afterRender.apply(this, arguments);

      storage.acquire();
    }

  });
});
