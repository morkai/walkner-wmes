// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

exports.DEFAULT_CONFIG = {
  divisionsId: 'divisions',
  subdivisionsId: 'subdivisions',
  mrpControllersId: 'mrpControllers',
  prodFlowsId: 'prodFlows',
  workCentersId: 'workCenters',
  prodLinesId: 'prodLines'
};

exports.start = function startOrgUnitsModule(app, module)
{
  var divisionsModule = app[module.config.divisionsId];
  var subdivisionsModule = app[module.config.subdivisionsId];
  var mrpControllersModule = app[module.config.mrpControllersId];
  var prodFlowsModule = app[module.config.prodFlowsId];
  var workCentersModule = app[module.config.workCentersId];
  var prodLinesModule = app[module.config.prodLinesId];

  var PARENT_TO_CHILD_MAP = {
    'division': 'subdivision',
    'subdivision': 'mrpController',
    'mrpController': 'prodFlow',
    'prodFlow': 'workCenter',
    'workCenter': 'prodLine',
    'prodLine': null
  };

  var CHILD_TO_PARENT_MAP = {
    'prodLine': 'workCenter',
    'workCenter': 'prodFlow',
    'prodFlow': 'mrpController',
    'mrpController': 'subdivision',
    'subdivision': 'division',
    'division': null
  };

  var TYPE_TO_MODULE_MAP = {
    'division': divisionsModule,
    'subdivision': subdivisionsModule,
    'mrpController': mrpControllersModule,
    'prodFlow': prodFlowsModule,
    'workCenter': workCentersModule,
    'prodLine': prodLinesModule
  };

  module.getType = function(orgUnit)
  {
    if (orgUnit.constructor === prodLinesModule.Model)
    {
      return 'prodLine';
    }

    if (orgUnit.constructor === workCentersModule.Model)
    {
      return 'workCenter';
    }

    if (orgUnit.constructor === prodFlowsModule.Model)
    {
      return 'prodFlow';
    }

    if (orgUnit.constructor === mrpControllersModule.Model)
    {
      return 'mrpController';
    }

    if (orgUnit.constructor === subdivisionsModule.Model)
    {
      return 'subdivision';
    }

    if (orgUnit.constructor === divisionsModule.Model)
    {
      return 'division';
    }

    throw new Error("Unknown org unit type!");
  };

  module.getByTypeAndId = function(type, id)
  {
    var orgUnitsModule = TYPE_TO_MODULE_MAP[type];

    if (!orgUnitsModule)
    {
      return null;
    }

    return orgUnitsModule.modelsById[id] || null;
  };

  module.getParent = function(childOrgUnit)
  {
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
  };

  module.getAllByType = function(type)
  {
    var orgUnitsModule = TYPE_TO_MODULE_MAP[type];

    if (!orgUnitsModule)
    {
      return [];
    }

    return orgUnitsModule.models;
  };

  module.getDivisionFor = function(orgUnitType, orgUnitId)
  {
    var orgUnit = arguments.length === 2
      ? this.getByTypeAndId(orgUnitType, orgUnitId)
      : orgUnitType;

    if (!orgUnit)
    {
      return null;
    }

    if (orgUnit.constructor === divisionsModule.Model)
    {
      return orgUnit;
    }

    return this.getDivisionFor(this.getParent(orgUnit));
  };

  module.getSubdivisionsFor = function(orgUnitType, orgUnitId)
  {
    var orgUnit = arguments.length === 2
      ? this.getByTypeAndId(orgUnitType, orgUnitId)
      : orgUnitType;

    if (!orgUnit)
    {
      return [];
    }

    if (orgUnit.constructor === divisionsModule.Model)
    {
      return subdivisionsModule.models.filter(function(subdivision)
      {
        return subdivision.division === orgUnit._id;
      });
    }

    if (orgUnit.constructor === subdivisionsModule.Model)
    {
      return [orgUnit];
    }

    return this.getSubdivisionsFor(this.getParent(orgUnit));
  };

  module.getSubdivisionFor = function(orgUnitType, orgUnitId)
  {
    var orgUnit = arguments.length === 2
      ? this.getByTypeAndId(orgUnitType, orgUnitId)
      : orgUnitType;

    if (!orgUnit || orgUnit.constructor === divisionsModule.Model)
    {
      return null;
    }

    if (orgUnit.constructor === subdivisionsModule.Model)
    {
      return orgUnit;
    }

    return this.getSubdivisionFor(this.getParent(orgUnit));
  };

  module.getAllByTypeForSubdivision = function(requestedType, subdivision)
  {
    return this.getAllByType(requestedType).filter(function(orgUnit)
    {
      return module.getSubdivisionFor(orgUnit) === subdivision;
    });
  };

  module.getProdFlowsFor = function(orgUnitType, orgUnitId)
  {
    var orgUnit = arguments.length === 2
      ? this.getByTypeAndId(orgUnitType, orgUnitId)
      : orgUnitType;

    if (!orgUnit)
    {
      return null;
    }

    if (orgUnit.constructor === prodFlowsModule.Model)
    {
      return [orgUnit];
    }

    if (orgUnit.constructor === prodLinesModule.Model)
    {
      return this.getProdFlowsFor('workCenter', orgUnit.workCenter);
    }

    if (orgUnit.constructor === workCentersModule.Model)
    {
      return this.getProdFlowsFor('prodFlow', orgUnit.prodFlow);
    }

    if (orgUnit.constructor === mrpControllersModule.Model)
    {
      return prodFlowsModule.models.filter(function(prodFlow)
      {
        return prodFlow.mrpController.indexOf(orgUnit._id) !== -1;
      });
    }

    if (orgUnit.constructor === subdivisionsModule.Model)
    {
      return mrpControllersModule.models
        .filter(function(mrpController)
        {
          return mrpController.subdivision
            && mrpController.subdivision.toString() === orgUnit._id.toString();
        })
        .reduce(function(prodFlows, mrpController)
        {
          return prodFlows.concat(module.getProdFlowsFor(mrpController));
        }, []);
    }

    if (orgUnit.constructor === divisionsModule.Model)
    {
      return subdivisionsModule.models
        .filter(function(subdivision){ return subdivision.division === orgUnit._id; })
        .reduce(function(prodFlows, subdivision)
        {
          return prodFlows.concat(module.getProdFlowsFor(subdivision));
        }, []);
    }

    return [];
  };

  module.getWorkCentersInProdFlow = function(prodFlow)
  {
    if (!prodFlow)
    {
      return [];
    }

    var prodFlowId = prodFlow._id.toString();

    return workCentersModule.models.filter(function(workCenter)
    {
      return workCenter.prodFlow && workCenter.prodFlow.toString() === prodFlowId;
    });
  };

  module.getProdLinesInProdFlow = function(prodFlow)
  {
    if (!prodFlow)
    {
      return [];
    }

    var workCenterIds = this.getChildren(prodFlow).map(function(workCenter)
    {
      return workCenter._id;
    });

    return prodLinesModule.models.filter(function(prodLine)
    {
      return workCenterIds.indexOf(prodLine.workCenter) !== -1;
    });
  };

  module.getChildType = function(orgUnitType)
  {
    return PARENT_TO_CHILD_MAP[orgUnitType] || 'division';
  };

  module.getChildren = function(parentOrgUnit)
  {
    var parentOrgUnitType = this.getType(parentOrgUnit);
    var childOrgUnitType = this.getChildType(parentOrgUnitType);
    var childOrgUnitsModule = TYPE_TO_MODULE_MAP[childOrgUnitType];

    return childOrgUnitsModule
      ? filterByParent(childOrgUnitsModule.models, parentOrgUnitType, parentOrgUnit)
      : [];
  };

  module.getAssemblyMrpControllersFor = function(orgUnitType, orgUnitId)
  {
    /*jshint -W015*/

    if (!orgUnitType || !orgUnitId)
    {
      return mrpControllersModule.models
        .map(function(mrpController) { return mrpController._id; })
        .filter(onlyAssemblyMrpControllers);
    }

    switch (orgUnitType)
    {
      case 'division':
        return subdivisionsModule.models
          .filter(function(subdivision)
          {
            return subdivision.division === orgUnitId && subdivision.type === 'assembly';
          })
          .reduce(
          function(mrpControllers, subdivision)
          {
            return mrpControllers.concat(
              module.getAssemblyMrpControllersFor('subdivision', subdivision._id.toString())
            );
          },
          []
        );

      case 'subdivision':
        var subdivision = subdivisionsModule.modelsById[orgUnitId];

        if (!subdivision)
        {
          return null;
        }

        if (subdivision.type !== 'assembly')
        {
          return [];
        }

        return mrpControllersModule.models
          .filter(function(mrpController)
          {
            return mrpController.subdivision
              && mrpController.subdivision.toString() === orgUnitId
              && !/^KS/.test(mrpController._id);
          })
          .map(function(mrpController) { return mrpController._id; });

      case 'mrpController':
        return [orgUnitId].filter(onlyAssemblyMrpControllers);

      case 'prodFlow':
        var prodFlow = prodFlowsModule.modelsById[orgUnitId];

        if (!prodFlow)
        {
          return null;
        }

        return (prodFlow ? prodFlow.mrpController : []).filter(onlyAssemblyMrpControllers);

      case 'workCenter':
        return null;

      case 'prodLine':
        return null;

      default:
        return null;
    }
  };

  module.getProdLinesFor = function(orgUnitType, orgUnitId)
  {
    var orgUnit = arguments.length === 2
      ? this.getByTypeAndId(orgUnitType, orgUnitId)
      : orgUnitType;

    if (!orgUnit)
    {
      return null;
    }

    if (orgUnit.constructor === prodLinesModule.Model)
    {
      return [orgUnit];
    }

    if (orgUnit.constructor === workCentersModule.Model)
    {
      return filterByParent(prodLinesModule.models, 'workCenter', orgUnit);
    }

    var workCenterIds = {};

    if (orgUnit.constructor === prodFlowsModule.Model)
    {
      this.getWorkCentersInProdFlow(orgUnit).forEach(function(workCenter)
      {
        workCenterIds[workCenter._id] = true;
      });
    }
    else
    {
      var prodFlows = this.getProdFlowsFor(orgUnit);

      workCenterIds = [];

      for (var i = 0, l = prodFlows.length; i < l; ++i)
      {
        var workCenters = this.getWorkCentersInProdFlow(prodFlows[i]);

        for (var ii = 0, ll = workCenters.length; ii < ll; ++ii)
        {
          workCenterIds[workCenters[ii]._id] = true;
        }
      }
    }

    return prodLinesModule.models.filter(function(prodLine)
    {
      return workCenterIds[prodLine.workCenter] === true;
    });
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
        return parentOrgUnitId.map(String).indexOf(parentOrgUnit._id.toString()) !== -1;
      }

      return String(parentOrgUnitId) === parentOrgUnit._id.toString();
    });
  }

  function onlyAssemblyMrpControllers(mrpControllerId)
  {
    if (/^KS/.test(mrpControllerId))
    {
      return false;
    }

    var mrpController = mrpControllersModule.modelsById[mrpControllerId];

    if (!mrpController)
    {
      return false;
    }

    var subdivision = subdivisionsModule.modelsById[mrpController.subdivision];

    return subdivision && subdivision.type === 'assembly';
  }
};
