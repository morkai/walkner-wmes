// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../core/Collection',
  '../data/orgUnits',
  './ProdLineState'
], function(
  _,
  Collection,
  orgUnits,
  ProdLineState
) {
  'use strict';

  return Collection.extend({

    model: ProdLineState,

    parse: function(res)
    {
      var prodLineStates = [];

      for (var i = 0, l = res.prodLineStates.length; i < l; ++i)
      {
        prodLineStates.push(ProdLineState.parse(res.prodLineStates[i]));
      }

      return prodLineStates;
    },

    getForDivision: function(divisionId)
    {
      var result = {};
      var prodLineStates = this;

      this.forEachProdLine(orgUnits.getByTypeAndId('division', divisionId), function(prodLine)
      {
        var prodLineState = prodLineStates.get(prodLine.id);

        if (prodLineState && !result[prodLine.id])
        {
          result[prodLine.id] = prodLineState;
        }
      });

      return _.values(result);
    },

    forEachProdLine: function(parentOrgUnit, callback)
    {
      var childOrgUnits = orgUnits.getChildren(parentOrgUnit);
      var i = 0;
      var l = childOrgUnits.length;

      if (orgUnits.getType(parentOrgUnit) === 'workCenter')
      {
        for (; i < l; ++i)
        {
          callback(childOrgUnits[i]);
        }
      }
      else
      {
        for (; i < l; ++i)
        {
          this.forEachProdLine(childOrgUnits[i], callback);
        }
      }
    }

  });
});
