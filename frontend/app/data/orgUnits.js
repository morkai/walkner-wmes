// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './divisions',
  './subdivisions',
  './mrpControllers',
  './prodFlows',
  './workCenters',
  './prodLines'
], function(
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters,
  prodLines
) {
  'use strict';

  var PARENT_TO_CHILD_MAP = {
    'division': 'subdivision',
    'subdivision': 'mrpController',
    'mrpController': 'prodFlow',
    'mrpControllers': 'prodFlow',
    'prodFlow': 'workCenter',
    'workCenter': 'prodLine',
    'prodLine': null
  };

  var CHILD_TO_PARENT_MAP = {
    'prodLine': 'workCenter',
    'workCenter': 'prodFlow',
    'prodFlow': 'mrpController',
    'mrpController': 'subdivision',
    'mrpControllers': 'subdivision',
    'subdivision': 'division',
    'division': null
  };

  var TYPE_TO_COLLECTION = {
    'division': divisions,
    'subdivision': subdivisions,
    'mrpController': mrpControllers,
    'mrpControllers': mrpControllers,
    'prodFlow': prodFlows,
    'workCenter': workCenters,
    'prodLine': prodLines
  };

  var TYPES = {
    'division': true,
    'subdivision': true,
    'mrpController': true,
    'mrpControllers': true,
    'prodFlow': true,
    'workCenter': true,
    'prodLine': true
  };

  function filterByParent(orgUnits, parentProperty, parentOrgUnit)
  {
    return orgUnits.filter(function(orgUnit)
    {
      var parentOrgUnitId = orgUnit.get(parentProperty);

      if (!parentOrgUnitId)
      {
        return false;
      }

      if (Array.isArray(parentOrgUnitId))
      {
        return parentOrgUnitId.indexOf(parentOrgUnit.id) !== -1;
      }

      return parentOrgUnitId === parentOrgUnit.id;
    });
  }

  return {
    TYPES: TYPES,
    getProdFlowsForSubdivision: function(subdivision)
    {
      if (typeof subdivision === 'string')
      {
        subdivision = subdivisions.get(subdivision);
      }

      if (!subdivision)
      {
        return [];
      }

      return prodFlows.filter(function(prodFlow)
      {
        return prodFlow.getSubdivision() === subdivision;
      });
    },
    getAllByType: function(orgUnitType)
    {
      return TYPE_TO_COLLECTION[orgUnitType].models;
    },
    getActiveByType: function(orgUnitType, filter)
    {
      if (!filter)
      {
        filter = function() { return true; };
      }

      return TYPE_TO_COLLECTION[orgUnitType].models.filter(function(orgUnit)
      {
        return !orgUnit.get('deactivatedAt') && filter(orgUnit);
      });
    },
    getAllDivisions: function()
    {
      return divisions.models;
    },
    getAllForProdLine: function(prodLine)
    {
      if (typeof prodLine === 'string')
      {
        prodLine = prodLines.get(prodLine);
      }

      var orgUnits = {
        division: null,
        subdivision: null,
        mrpControllers: null,
        prodFlow: null,
        workCenter: null,
        prodLine: null
      };

      if (!prodLine)
      {
        return orgUnits;
      }

      orgUnits.prodLine = prodLine.id;

      var workCenter = workCenters.get(prodLine.get('workCenter'));

      if (!workCenter)
      {
        return orgUnits;
      }

      orgUnits.workCenter = workCenter.id;

      var prodFlow = prodFlows.get(workCenter.get('prodFlow'));

      if (!prodFlow)
      {
        return orgUnits;
      }

      orgUnits.prodFlow = prodFlow.id;

      var mrpController = prodFlow.get('mrpController');

      if (!Array.isArray(mrpController) || !mrpController.length)
      {
        return orgUnits;
      }

      orgUnits.mrpControllers = mrpController;

      mrpController = mrpControllers.get(mrpController[0]);

      if (!mrpController)
      {
        return orgUnits;
      }

      var subdivision = subdivisions.get(mrpController.get('subdivision'));

      if (!subdivision)
      {
        return orgUnits;
      }

      orgUnits.subdivision = subdivision.id;

      var division = divisions.get(subdivision.get('division'));

      if (!division)
      {
        return orgUnits;
      }

      orgUnits.division = division.id;

      return orgUnits;
    },
    getType: function(orgUnit)
    {
      if (orgUnit === null)
      {
        return null;
      }

      if (orgUnit.constructor === prodLines.model)
      {
        return 'prodLine';
      }

      if (orgUnit.constructor === workCenters.model)
      {
        return 'workCenter';
      }

      if (orgUnit.constructor === prodFlows.model)
      {
        return 'prodFlow';
      }

      if (orgUnit.constructor === mrpControllers.model)
      {
        return 'mrpController';
      }

      if (orgUnit.constructor === subdivisions.model)
      {
        return 'subdivision';
      }

      if (orgUnit.constructor === divisions.model)
      {
        return 'division';
      }

      throw new Error('Unknown org unit type!');
    },
    getChildType: function(orgUnitType)
    {
      return PARENT_TO_CHILD_MAP[orgUnitType] || 'division';
    },
    getChildren: function(parentOrgUnit)
    {
      var parentOrgUnitType = this.getType(parentOrgUnit);
      var childOrgUnitType = this.getChildType(parentOrgUnitType);
      var childOrgUnits = TYPE_TO_COLLECTION[childOrgUnitType];

      return childOrgUnits ? filterByParent(childOrgUnits, parentOrgUnitType, parentOrgUnit) : [];
    },
    getByTypeAndId: function(type, id)
    {
      var collection = TYPE_TO_COLLECTION[type];

      if (!collection)
      {
        return null;
      }

      return collection.get(id) || null;
    },
    getParent: function(childOrgUnit)
    {
      if (!childOrgUnit)
      {
        return null;
      }

      var childOrgUnitType = this.getType(childOrgUnit);
      var parentOrgUnitType = CHILD_TO_PARENT_MAP[childOrgUnitType];
      var parentOrgUnitId = childOrgUnit.get(parentOrgUnitType);

      if (!parentOrgUnitId || (Array.isArray(parentOrgUnitId) && !parentOrgUnitId.length))
      {
        return null;
      }

      return this.getByTypeAndId(
        parentOrgUnitType,
        Array.isArray(parentOrgUnitId) ? parentOrgUnitId[0] : parentOrgUnitId
      );
    },
    RELATION_TYPES: {
      SIBLINGS: 'siblings',
      TYPES: 'types',
      CHILD: 'child',
      DIFFERENT_CHILD: 'differentChild',
      PARENT: 'parent',
      DIFFERENT_PARENT: 'differentParent',
      UNRELATED: 'unrelated'
    },
    getRelationType: function(oldOrgUnitType, oldOrgUnitId, newOrgUnitType, newOrgUnitId)
    {
      if (oldOrgUnitType === null && newOrgUnitType === 'division')
      {
        return this.RELATION_TYPES.CHILD;
      }

      if (oldOrgUnitType === 'division' && newOrgUnitType === null)
      {
        return this.RELATION_TYPES.PARENT;
      }

      var oldOrgUnit = this.getByTypeAndId(oldOrgUnitType, oldOrgUnitId);
      var newOrgUnit = this.getByTypeAndId(newOrgUnitType, newOrgUnitId);

      if (oldOrgUnitType === newOrgUnitType)
      {
        return this.getParent(oldOrgUnit) === this.getParent(newOrgUnit)
          ? this.RELATION_TYPES.SIBLINGS
          : this.RELATION_TYPES.TYPES;
      }

      if (PARENT_TO_CHILD_MAP[oldOrgUnitType] === newOrgUnitType)
      {
        return this.getParent(newOrgUnit) === oldOrgUnit
          ? this.RELATION_TYPES.CHILD
          : this.RELATION_TYPES.DIFFERENT_PARENT;
      }

      if (CHILD_TO_PARENT_MAP[oldOrgUnitType] === newOrgUnitType)
      {
        return this.getParent(oldOrgUnit) === newOrgUnit
          ? this.RELATION_TYPES.PARENT
          : this.RELATION_TYPES.DIFFERENT_CHILD;
      }

      return this.RELATION_TYPES.UNRELATED;
    },
    getDivisionFor: function(orgUnit)
    {
      if (!orgUnit)
      {
        return null;
      }

      if (orgUnit.constructor === divisions.model)
      {
        return orgUnit;
      }

      if (orgUnit.constructor !== subdivisions.model)
      {
        orgUnit = this.getSubdivisionFor(orgUnit);
      }

      return this.getParent(orgUnit);
    },
    getSubdivisionFor: function(orgUnit)
    {
      if (!orgUnit || orgUnit.constructor === divisions.model)
      {
        return null;
      }

      if (orgUnit.constructor === subdivisions.model)
      {
        return orgUnit;
      }

      return this.getSubdivisionFor(this.getParent(orgUnit));
    },
    containsProdLine: function(orgUnitType, orgUnitIds, prodLineId)
    {
      if (orgUnitType === 'prodLine')
      {
        return Array.isArray(orgUnitIds) ? orgUnitIds.indexOf(prodLineId) !== -1 : orgUnitIds === prodLineId;
      }

      var orgUnit = this.getByTypeAndId('prodLine', prodLineId);

      do // eslint-disable-line no-constant-condition
      {
        var parent = this.getParent(orgUnit);

        if (!parent)
        {
          return false;
        }

        if (this.getType(parent) === orgUnitType)
        {
          return Array.isArray(orgUnitIds) ? orgUnitIds.indexOf(parent.id) !== -1 : orgUnitIds === parent.id;
        }

        orgUnit = parent;
      }
      while (true); // eslint-disable-line no-constant-condition
    }
  };
});
