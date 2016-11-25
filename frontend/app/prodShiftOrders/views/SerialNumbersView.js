// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/prodShiftOrders/templates/serialNumbers'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: {},

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        prodShiftOrderId: this.model.id,
        serialNumbers: this.collection.toJSON()
      };
    }

  });

});
