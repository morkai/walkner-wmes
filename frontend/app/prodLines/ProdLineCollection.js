// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    rqlQuery: 'select(workCenter,description,inventoryNo)&sort(workCenter,_id)',

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
