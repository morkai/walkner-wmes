// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
