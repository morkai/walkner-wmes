// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  './MrpController'
], function(
  user,
  Collection,
  MrpController
) {
  'use strict';

  return Collection.extend({

    model: MrpController,

    rqlQuery: 'sort(_id)',

    comparator: '_id',

    getForCurrentUser: function()
    {
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();

      return this.filter(function(mrpController)
      {
        if (user.data.super || !userDivision || userDivision.get('type') !== 'prod')
        {
          return true;
        }

        var mrpSubdivision = mrpController.getSubdivision();

        if (!mrpSubdivision)
        {
          return true;
        }

        if (userSubdivision)
        {
          return mrpSubdivision.id === userSubdivision.id;
        }

        var prodLineDivision = mrpSubdivision.get('division');

        if (!prodLineDivision)
        {
          return true;
        }

        return prodLineDivision === userDivision.id;
      });
    }

  });
});
