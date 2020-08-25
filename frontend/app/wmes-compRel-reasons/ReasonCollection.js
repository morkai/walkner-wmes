// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Reason'
], function(
  Collection,
  Reason
) {
  'use strict';

  return Collection.extend({

    model: Reason,

    getLabel: function(id)
    {
      var model = this.get(id);

      return model ? model.getLabel() : id;
    }

  });
});
