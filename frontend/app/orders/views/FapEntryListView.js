// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-fap-entries/views/ListView',
  'app/orders/templates/fapEntryList'
], function(
  View,
  FapEntryListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.insertView('.orders-fap', new FapEntryListView({
        collection: this.collection,
        orderDetails: true
      }));
    }

  });
});
