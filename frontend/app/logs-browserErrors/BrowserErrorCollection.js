// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './BrowserError'
], function(
  Collection,
  BrowserError
) {
  'use strict';

  return Collection.extend({

    model: BrowserError,

    rqlQuery: 'sort(time)&limit(30)&resolved=false',

    initialize: function()
    {
      Collection.prototype.initialize.apply(this, arguments);

      this.expanded = {};
    }

  });
});
