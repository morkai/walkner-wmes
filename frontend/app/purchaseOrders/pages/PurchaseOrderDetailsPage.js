// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/DetailsPage',
  '../views/PurchaseOrderDetailsView'
], function(
  DetailsPage,
  PurchaseOrderDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: PurchaseOrderDetailsView,

    actions: [],

    remoteTopics: {
      'purchaseOrders.synced': function(message)
      {
        if (message.created || message.updated || message.closed)
        {
          this.promised(this.model.fetch());
        }
      }
    }

  });
});
