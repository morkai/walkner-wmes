// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../PressWorksheetCollection',
  '../views/PressWorksheetDetailsView'
], function(
  user,
  pageActions,
  DetailsPage,
  PressWorksheetCollection,
  PressWorksheetDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: PressWorksheetDetailsView,

    actions: function(layout)
    {
      var eightHours = 8 * 3600 * 1000;
      var now = Date.now();
      var actions = [
        pageActions.export(layout, this, new PressWorksheetCollection(null, {
          rqlQuery: '_id=' + this.model.id
        }))
      ];

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
