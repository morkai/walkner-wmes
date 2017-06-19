// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/pages/DetailsPage',
  '../views/ProdLineDetailsView'
], function(
  user,
  DetailsPage,
  ProdLineDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: ProdLineDetailsView,

    actions: function()
    {
      return this.model.get('deactivatedAt') && !user.data.super ? [] : DetailsPage.prototype.actions.call(this);
    }

  });
});
