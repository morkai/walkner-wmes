// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

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

  var cache = null;
  var rebuildingCache = 0;

  app.broker.subscribe('app.started', rebuildCache).setLimit(1);

  _.forEach(Object.keys(TYPE_TO_MODULE_MAP), function(topicPrefix)
  {
    app.broker.subscribe(topicPrefix + 's.added', rebuildCache);
    app.broker.subscribe(topicPrefix + 's.edited', rebuildCache);
    app.broker.subscribe(topicPrefix + 's.deleted', rebuildCache);
  });

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

    return orgUnitsModule ? orgUnitsModule.models : [];
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

    var orgUnitCache = cache && cache[orgUnit._id];

    if (orgUnitCache)
    {
      return orgUnitCache.division;
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

    var orgUnitCache = cache && cache[orgUnit._id];

    if (orgUnitCache)
    {
      if (!orgUnitCache.subdivision)
      {
        return [];
      }

      if (orgUnitCache.subdivision._id)
      {
        return [orgUnitCache.subdivision];
      }

      return orgUnitCache.subdivision.list.slice();
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

    var orgUnitCache = cache && cache[orgUnit._id];

    if (orgUnitCache)
    {
      return orgUnitCache.subdivision;
    }

    return this.getSubdivisionFor(this.getParent(orgUnit));
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

    var orgUnitCache = cache && cache[orgUnit._id];

    if (orgUnitCache)
    {
      return orgUnitCache.prodFlow.list.slice();
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

  module.getChildType = function(orgUnitType)
  {
    return PARENT_TO_CHILD_MAP[orgUnitType] || 'division';
  };

  module.getChildren = function(parentOrgUnit)
  {
    var parentOrgUnitType = this.getType(parentOrgUnit);
    var childOrgUnitType = this.getChildType(parentOrgUnitType);

    var parentOrgUnitCache = cache && cache[parentOrgUnitType] && cache[parentOrgUnitType][parentOrgUnit._id];

    if (parentOrgUnitCache)
    {
      var childOrgUnitCache = parentOrgUnitCache[childOrgUnitType];

      return childOrgUnitCache ? childOrgUnitCache.list.slice() : [];
    }

    var childOrgUnitsModule = TYPE_TO_MODULE_MAP[childOrgUnitType];

    return childOrgUnitsModule
      ? filterByParent(childOrgUnitsModule.models, parentOrgUnitType, parentOrgUnit)
      : [];
  };

  module.getAssemblyMrpControllersFor = function(orgUnitType, orgUnitId)
  {
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
          .reduce(function(mrpControllers, subdivision)
          {
            return mrpControllers.concat(
              module.getAssemblyMrpControllersFor('subdivision', subdivision._id.toString())
            );
          }, []);

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

    var orgUnitCache = cache && cache[orgUnitType] && cache[orgUnitType][orgUnitId];

    if (orgUnitCache)
    {
      return orgUnitCache.prodLine.list.slice();
    }

    if (orgUnit.constructor === workCentersModule.Model)
    {
      return filterByParent(prodLinesModule.models, 'workCenter', orgUnit);
    }

    var workCenterIds = {};

    if (orgUnit.constructor === prodFlowsModule.Model)
    {
      _.forEach(this.getChildren(orgUnit), function(workCenter)
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
        var workCenters = this.getChildren(prodFlows[i]);

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

  module.getAllForProdLine = function(prodLine, orgUnits)
  {
    if (!orgUnits)
    {
      orgUnits = {};
    }

    orgUnits.division = null;
    orgUnits.subdivision = null;
    orgUnits.mrpControllers = null;
    orgUnits.prodFlow = null;
    orgUnits.workCenter = null;
    orgUnits.prodLine = null;

    if (!prodLine)
    {
      return orgUnits;
    }

    if (prodLine.constructor !== prodLinesModule.Model)
    {
      prodLine = this.getByTypeAndId('prodLine', prodLine);
    }

    if (!prodLine)
    {
      return orgUnits;
    }

    orgUnits.prodLine = prodLine._id;

    var prodLineCache = cache && cache.prodLine[orgUnits.prodLine];

    if (prodLineCache)
    {
      if (prodLineCache.division !== null)
      {
        orgUnits.division = prodLineCache.division._id;
      }

      if (prodLineCache.subdivision !== null)
      {
        orgUnits.subdivision = prodLineCache.subdivision._id;
      }

      if (prodLineCache.mrpController !== null)
      {
        orgUnits.mrpControllers = prodLineCache.mrpController.map(function(mrpController)
        {
          return mrpController._id;
        });
      }

      if (prodLineCache.prodFlow !== null)
      {
        orgUnits.prodFlow = prodLineCache.prodFlow._id;
      }

      if (prodLineCache.workCenter !== null)
      {
        orgUnits.workCenter = prodLineCache.workCenter._id;
      }

      return orgUnits;
    }

    var workCenter = workCentersModule.modelsById[prodLine.workCenter];

    if (!workCenter)
    {
      return orgUnits;
    }

    orgUnits.workCenter = workCenter._id;

    var prodFlow = prodFlowsModule.modelsById[workCenter.prodFlow];

    if (!prodFlow)
    {
      return orgUnits;
    }

    orgUnits.prodFlow = prodFlow._id;

    var mrpController = prodFlow.mrpController;

    if (!Array.isArray(mrpController) || !mrpController.length)
    {
      return orgUnits;
    }

    orgUnits.mrpControllers = mrpController;

    mrpController = mrpControllersModule.modelsById[mrpController[0]];

    if (!mrpController)
    {
      return;
    }

    var subdivision = subdivisionsModule.modelsById[mrpController.subdivision];

    if (!subdivision)
    {
      return orgUnits;
    }

    orgUnits.subdivision = subdivision._id;

    var division = divisionsModule.modelsById[subdivision.division];

    if (!division)
    {
      return orgUnits;
    }

    orgUnits.division = division._id;

    return orgUnits;
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

  function rebuildCache()
  {
    cache = null;
    rebuildingCache += 1;

    if (rebuildingCache !== 1)
    {
      return;
    }

    var t = Date.now();

    var workingCache = {
      division: {},
      subdivision: {},
      mrpController: {},
      prodFlow: {},
      workCenter: {},
      prodLine: {}
    };

    var prodLines = prodLinesModule.models;
    var batchSize = 5;
    var batchCount = Math.ceil(prodLines.length / batchSize);
    var steps = [];

    for (var i = 0; i < batchCount; ++i)
    {
      steps.push(createRebuildCacheStep(workingCache, prodLines.slice(i * batchSize, i * batchSize + batchSize)));
    }

    steps.push(function()
    {
      if (rebuildingCache === 1)
      {
        cache = workingCache;
        rebuildingCache = 0;

        t = Date.now() - t;

        module.debug("Rebuilt cache in %d ms.", t);
      }
      else
      {
        rebuildingCache = 0;

        setImmediate(rebuildCache);
      }
    });

    step(steps);
  }

  function createRebuildCacheStep(workingCache, prodLines)
  {
    return function rebuildCacheStep()
    {
      if (rebuildingCache !== 1)
      {
        return this.skip();
      }

      for (var i = 0, l = prodLines.length; i < l; ++i)
      {
        rebuildCacheFromOrgUnits(workingCache, module.getAllForProdLine(prodLines[i]));
      }

      setImmediate(this.next());
    };
  }

  function rebuildCacheFromOrgUnits(workingCache, orgUnits)
  {
    rebuildDivisionCache(workingCache, orgUnits);
    rebuildSubdivisionCache(workingCache, orgUnits);
    rebuildMrpControllerCache(workingCache, orgUnits);
    rebuildProdFlowCache(workingCache, orgUnits);
    rebuildWorkCenterCache(workingCache, orgUnits);
    rebuildProdLineCache(workingCache, orgUnits);
  }

  function rebuildDivisionCache(workingCache, orgUnits)
  {
    if (orgUnits.division === null)
    {
      return;
    }

    if (workingCache.division[orgUnits.division] === undefined)
    {
      workingCache.division[orgUnits.division] = {
        division: divisionsModule.modelsById[orgUnits.division],
        subdivision: mapAndList(),
        mrpController: mapAndList(),
        prodFlow: mapAndList(),
        workCenter: mapAndList(),
        prodLine: mapAndList()
      };
    }

    var divisionCache = workingCache.division[orgUnits.division];

    addToMapAndList(divisionCache, orgUnits, 'subdivision');
    addMrpControllersToMapAndList(divisionCache, orgUnits);
    addToMapAndList(divisionCache, orgUnits, 'prodFlow');
    addToMapAndList(divisionCache, orgUnits, 'workCenter');
    addToMapAndList(divisionCache, orgUnits, 'prodLine');
  }

  function rebuildSubdivisionCache(workingCache, orgUnits)
  {
    if (orgUnits.subdivision === null)
    {
      return;
    }

    if (workingCache.subdivision[orgUnits.subdivision] === undefined)
    {
      workingCache.subdivision[orgUnits.subdivision] = {
        division: null,
        subdivision: subdivisionsModule.modelsById[orgUnits.subdivision],
        mrpController: mapAndList(),
        prodFlow: mapAndList(),
        workCenter: mapAndList(),
        prodLine: mapAndList()
      };
    }

    var subdivisionCache = workingCache.subdivision[orgUnits.subdivision];

    subdivisionCache.division = divisionsModule.modelsById[orgUnits.division] || null;

    addMrpControllersToMapAndList(subdivisionCache, orgUnits);
    addToMapAndList(subdivisionCache, orgUnits, 'prodFlow');
    addToMapAndList(subdivisionCache, orgUnits, 'workCenter');
    addToMapAndList(subdivisionCache, orgUnits, 'prodLine');
  }

  function rebuildMrpControllerCache(workingCache, orgUnits)
  {
    var mrpControllers = orgUnits.mrpControllers;

    if (mrpControllers === null)
    {
      return;
    }

    var mrpControllerCount = mrpControllers.length;

    for (var i = 0; i < mrpControllerCount; ++i)
    {
      var mrpControllerId = mrpControllers[i];

      if (workingCache.mrpController[mrpControllerId] === undefined)
      {
        workingCache.mrpController[mrpControllerId] = {
          division: null,
          subdivision: null,
          mrpController: mrpControllersModule.modelsById[mrpControllerId],
          prodFlow: mapAndList(),
          workCenter: mapAndList(),
          prodLine: mapAndList()
        };
      }

      var mrpControllerCache = workingCache.mrpController[mrpControllerId];

      mrpControllerCache.division = divisionsModule.modelsById[orgUnits.division] || null;
      mrpControllerCache.subdivision = subdivisionsModule.modelsById[orgUnits.subdivision] || null;

      addToMapAndList(mrpControllerCache, orgUnits, 'prodFlow');
      addToMapAndList(mrpControllerCache, orgUnits, 'workCenter');
      addToMapAndList(mrpControllerCache, orgUnits, 'prodLine');
    }
  }

  function rebuildProdFlowCache(workingCache, orgUnits)
  {
    if (orgUnits.prodFlow === null)
    {
      return;
    }

    if (workingCache.prodFlow[orgUnits.prodFlow] === undefined)
    {
      workingCache.prodFlow[orgUnits.prodFlow] = {
        division: null,
        subdivision: null,
        mrpController: null,
        prodFlow: prodFlowsModule.modelsById[orgUnits.prodFlow],
        workCenter: mapAndList(),
        prodLine: mapAndList()
      };
    }

    var prodFlowCache = workingCache.prodFlow[orgUnits.prodFlow];

    prodFlowCache.division = divisionsModule.modelsById[orgUnits.division] || null;
    prodFlowCache.subdivision = subdivisionsModule.modelsById[orgUnits.subdivision] || null;
    prodFlowCache.mrpController = getParentMrpControllers(orgUnits.mrpControllers);

    addToMapAndList(prodFlowCache, orgUnits, 'workCenter');
    addToMapAndList(prodFlowCache, orgUnits, 'prodLine');
  }

  function rebuildWorkCenterCache(workingCache, orgUnits)
  {
    if (orgUnits.workCenter === null)
    {
      return;
    }

    if (workingCache.workCenter[orgUnits.workCenter] === undefined)
    {
      workingCache.workCenter[orgUnits.workCenter] = {
        division: null,
        subdivision: null,
        mrpController: null,
        prodFlow: null,
        workCenter: workCentersModule.modelsById[orgUnits.workCenter],
        prodLine: mapAndList()
      };
    }

    var workCenterCache = workingCache.workCenter[orgUnits.workCenter];

    workCenterCache.division = divisionsModule.modelsById[orgUnits.division] || null;
    workCenterCache.subdivision = subdivisionsModule.modelsById[orgUnits.subdivision] || null;
    workCenterCache.mrpController = getParentMrpControllers(orgUnits.mrpControllers);
    workCenterCache.prodFlow = prodFlowsModule.modelsById[orgUnits.prodFlow] || null;

    addToMapAndList(workCenterCache, orgUnits, 'prodLine');
  }

  function rebuildProdLineCache(workingCache, orgUnits)
  {
    if (orgUnits.prodLine === null)
    {
      return;
    }

    workingCache.prodLine[orgUnits.prodLine] = {
      division: divisionsModule.modelsById[orgUnits.division] || null,
      subdivision: subdivisionsModule.modelsById[orgUnits.subdivision] || null,
      mrpController: getParentMrpControllers(orgUnits.mrpControllers),
      prodFlow: prodFlowsModule.modelsById[orgUnits.prodFlow] || null,
      workCenter: workCentersModule.modelsById[orgUnits.workCenter] || null,
      prodLine: prodLinesModule.modelsById[orgUnits.prodLine]
    };
  }

  function mapAndList()
  {
    return {
      map: {},
      list: []
    };
  }

  function addToMapAndList(parentCache, orgUnits, childOrgUnitType)
  {
    var childOrgUnitId = orgUnits[childOrgUnitType];
    var childOrgUnit = TYPE_TO_MODULE_MAP[childOrgUnitType].modelsById[childOrgUnitId];

    if (childOrgUnit !== null && parentCache[childOrgUnitType].map[childOrgUnitId] === undefined)
    {
      parentCache[childOrgUnitType].map[childOrgUnitId] = childOrgUnit;
      parentCache[childOrgUnitType].list.push(childOrgUnit);
    }
  }

  function addMrpControllersToMapAndList(parentCache, orgUnits)
  {
    if (!Array.isArray(orgUnits.mrpControllers))
    {
      return;
    }

    var mrpControllerCount = orgUnits.mrpControllers.length;

    for (var i = 0; i < mrpControllerCount; ++i)
    {
      var mrpControllerId = orgUnits.mrpControllers[i];
      var mrpController = mrpControllersModule.modelsById[mrpControllerId];

      if (mrpController !== undefined && parentCache.mrpController[mrpControllerId] === undefined)
      {
        parentCache.mrpController.map[mrpControllerId] = mrpController;
        parentCache.mrpController.list.push(mrpControllerId);
      }
    }
  }

  function getParentMrpControllers(mrpControllerIds)
  {
    var mrpControllers = [];

    if (!Array.isArray(mrpControllerIds))
    {
      return mrpControllers;
    }

    for (var i = 0, l = mrpControllerIds.length; i < l; ++i)
    {
      var mrpController = mrpControllersModule.modelsById[mrpControllerIds[i]];

      if (mrpController !== undefined)
      {
        mrpControllers.push(mrpController);
      }
    }

    return mrpControllers;
  }
};
