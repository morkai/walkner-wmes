// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    initialize: function(models, options)
    {
      this.settings = options && options.settings ? options.settings : null;
    },

    /**
     * @param {object} res
     * @returns {Array.<object>}
     */
    parse: function(res)
    {
      var prodLineStates = [];

      for (var i = 0, l = res.prodLineStates.length; i < l; ++i)
      {
        prodLineStates.push(new ProdLineState(ProdLineState.parse(res.prodLineStates[i]), {
          settings: this.settings
        }));
      }

      return prodLineStates;
    },

    /**
     * @param {string} orgUnitType
     * @param {Array.<string>} orgUnitIds
     * @param {function(string, string): boolean} [isBlacklisted]
     * @returns {Array.<object>}
     */
    getByOrgUnit: function(orgUnitType, orgUnitIds, isBlacklisted)
    {
      if (orgUnitType === 'prodLine' || typeof isBlacklisted !== 'function')
      {
        isBlacklisted = function() { return false; };
      }

      var result = {};
      var prodLineStates = this;

      if (orgUnitType === 'prodLine')
      {
        orgUnitIds.forEach(function(prodLineId)
        {
          var prodLineState = prodLineStates.get(prodLineId);

          if (prodLineState
            && !isBlacklisted('prodLine', prodLineId)
            && !orgUnits.getByTypeAndId('prodLine', prodLineId).get('deactivatedAt'))
          {
            result[prodLineId] = prodLineState;
          }
        });
      }
      else
      {
        orgUnitIds.forEach(function(orgUnitId)
        {
          var orgUnit = orgUnits.getByTypeAndId(orgUnitType, orgUnitId);

          prodLineStates.forEachProdLine(orgUnit, isBlacklisted, false, function(prodLine)
          {
            var prodLineState = prodLineStates.get(prodLine.id);

            if (prodLineState
              && !isBlacklisted('prodLine', prodLine.id)
              && !orgUnits.getByTypeAndId('prodLine', prodLine.id).get('deactivatedAt'))
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
     * @param {function} isBlacklisted
     * @param {boolean} useBlacklist
     * @param {function} callback
     */
    forEachProdLine: function(parentOrgUnit, isBlacklisted, useBlacklist, callback)
    {
      var parentOrgUnitType = orgUnits.getType(parentOrgUnit);

      if ((useBlacklist && isBlacklisted(parentOrgUnitType, parentOrgUnit.id)) || parentOrgUnit.get('deactivatedAt'))
      {
        return;
      }

      var childOrgUnits = orgUnits.getChildren(parentOrgUnit);
      var i = 0;
      var l = childOrgUnits.length;

      if (parentOrgUnitType === 'workCenter')
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
          this.forEachProdLine(childOrgUnits[i], isBlacklisted, true, callback);
        }
      }
    }

  });
});
