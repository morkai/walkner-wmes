// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/decoratePressWorksheet',
  'app/pressWorksheets/templates/details'
], function(
  user,
  pageActions,
  DetailsPage,
  decoratePressWorksheet,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    detailsTemplate: detailsTemplate,

    serializeDetails: decoratePressWorksheet,

    actions: function()
    {
      var eightHours = 8 * 3600 * 1000;
      var now = Date.now();
      var actions = [];

      if (user.isAllowedTo('PROD_DATA:MANAGE')
        || (user.data._id === this.model.get('creator').id
          && Date.parse(this.model.get('createdAt')) + eightHours > now))
      {
        actions.push(
          pageActions.edit(this.model),
          pageActions.delete(this.model)
        );
      }

      return actions;
    }

  });
});
