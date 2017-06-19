// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Document'
], function(
  Collection,
  Document
) {
  'use strict';

  return Collection.extend({

    model: Document,

    parse: function(res)
    {
      if (res.collection)
      {
        res.collection.forEach(function(component, i)
        {
          component.index = i;
        });
      }

      return res;
    }

  });
});
