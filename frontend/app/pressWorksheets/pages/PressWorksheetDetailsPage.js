// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/PressWorksheetDetailsView'
], function(
  user,
  pageActions,
  DetailsPage,
  PressWorksheetDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: PressWorksheetDetailsView,

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
