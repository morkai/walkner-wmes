// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  './ProdLine'
], function(
  user,
  Collection,
  ProdLine
) {
  'use strict';

  return Collection.extend({

    model: ProdLine,

    rqlQuery: 'select(workCenter,description,inventoryNo,deactivatedAt)&sort(workCenter,_id)',

    getForCurrentUser: function()
    {
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();

      return this.filter(function(prodLine)
      {
        if (user.data.super || !userDivision || userDivision.get('type') !== 'prod')
        {
          return true;
        }

        var prodLineSubdivision = prodLine.getSubdivision();

        if (!prodLineSubdivision)
        {
          return true;
        }

        if (userSubdivision)
        {
          return prodLineSubdivision.id === userSubdivision.id;
        }

        var prodLineDivision = prodLineSubdivision.get('division');

        if (!prodLineDivision)
        {
          return true;
        }

        return prodLineDivision === userDivision.id;
      });
    }

  });
});
