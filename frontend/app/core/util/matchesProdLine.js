// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/user',
  'app/data/prodLines'
], function(
  _,
  user,
  prodLines
) {
  'use strict';

  return function matchesProdLine(rqlQuery, prodLineId)
  {
    var prodLineTerm = _.find(rqlQuery.selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'prodLine';
    });

    if (prodLineTerm)
    {
      return prodLineTerm.args[1] === prodLineId;
    }

    if (user.data.super)
    {
      return true;
    }

    var prodLine = prodLines.get(prodLineId);

    if (!prodLine)
    {
      return true;
    }

    var userDivision = user.getDivision();

    if (!userDivision)
    {
      return true;
    }

    var userSubdivision = user.getSubdivision();
    var prodLineSubdivision = prodLine.getSubdivision();

    if (userSubdivision)
    {
      return userSubdivision === prodLineSubdivision;
    }

    return userDivision.id === prodLineSubdivision.get('division');
  };
});
