// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './Resolution'
], function(
  Collection,
  Resolution
) {
  'use strict';

  return Collection.extend({

    model: Resolution,

    paginate: false,

    initialize: function(models, options)
    {
      this.parent = options.parent;
    },

    url: function()
    {
      return `${this.parent.urlRoot}/${this.parent.id}/resolutions`;
    }

  });
});
