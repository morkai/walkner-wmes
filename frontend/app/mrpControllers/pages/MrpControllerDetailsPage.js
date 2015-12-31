// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/pages/DetailsPage',
  '../views/MrpControllerDetailsView'
], function(
  user,
  DetailsPage,
  MrpControllerDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: MrpControllerDetailsView,

    actions: function()
    {
      return this.model.get('deactivatedAt') && !user.data.super ? [] : DetailsPage.prototype.actions.call(this);
    }

  });
});
