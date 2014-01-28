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

    rqlQuery: 'select(workCenter,description)&sort(workCenter,_id)',

    getForCurrentUser: function()
    {
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();

      return this.filter(function(prodLine)
      {
        if (user.data.super || !userDivision)
        {
          return true;
        }

        if (userSubdivision)
        {
          return prodLine.get('subdivision') === userSubdivision.id;
        }

        var prodLineSubdivision = prodLine.getSubdivision();

        if (!prodLineSubdivision)
        {
          return true;
        }

        var prodLineDivision = prodLineSubdivision.getDivision();

        if (!prodLineDivision)
        {
          return true;
        }

        return prodLineDivision === userDivision;
      });
    }

  });
});
