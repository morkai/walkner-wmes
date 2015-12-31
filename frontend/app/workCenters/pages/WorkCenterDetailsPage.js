// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/pages/DetailsPage',
  '../views/WorkCenterDetailsView'
], function(
  user,
  DetailsPage,
  WorkCenterDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: WorkCenterDetailsView,

    actions: function()
    {
      return this.model.get('deactivatedAt') && !user.data.super ? [] : DetailsPage.prototype.actions.call(this);
    }

  });
});
