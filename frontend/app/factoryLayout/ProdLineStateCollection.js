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

    /**
     * @param {object} res
     * @returns {Array.<object>}
     */
    parse: function(res)
    {
      var prodLineStates = [];

      for (var i = 0, l = res.prodLineStates.length; i < l; ++i)
      {
        prodLineStates.push(ProdLineState.parse(res.prodLineStates[i]));
      }

      return prodLineStates;
    },

    /**
     * @param {string} orgUnitType
     * @param {Array.<string>} orgUnitIds
     * @returns {Array.<object>}
     */
    getByOrgUnit: function(orgUnitType, orgUnitIds)
    {
      var result = {};
      var prodLineStates = this;

      if (orgUnitType === 'prodLine')
      {
        orgUnitIds.forEach(function(prodLineId)
        {
          var prodLineState = prodLineStates.get(prodLineId);

          if (prodLineState)
          {
            result[prodLineId] = prodLineState;
          }
        });
      }
      else
      {
        orgUnitIds.forEach(function(orgUnitId)
        {
          prodLineStates.forEachProdLine(orgUnits.getByTypeAndId(orgUnitType, orgUnitId), function(prodLine)
          {
            var prodLineState = prodLineStates.get(prodLine.id);

            if (prodLineState)
            {
              result[prodLine.id] = prodLineState;
            }
          });
        });
      }

      return _.values(result);
    },

    /**
     * @private
     * @param {object} parentOrgUnit
     * @param {function} callback
     */
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
