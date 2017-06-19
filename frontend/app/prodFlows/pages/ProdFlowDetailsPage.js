// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/pages/DetailsPage',
  '../views/ProdFlowDetailsView'
], function(
  user,
  DetailsPage,
  ProdFlowDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: ProdFlowDetailsView,

    actions: function()
    {
      return this.model.get('deactivatedAt') && !user.data.super ? [] : DetailsPage.prototype.actions.call(this);
    }

  });
});
