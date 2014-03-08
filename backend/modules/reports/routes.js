'use strict';

var report1 = require('./report1');
var report2 = require('./report2');
var report3 = require('./report3');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  var express = app[reportsModule.config.expressId];
  var userModule = app[reportsModule.config.userId];
  var mongoose = app[reportsModule.config.mongooseId];
  var settings = app[reportsModule.config.settingsId];
  var downtimeReasonsModule = app.downtimeReasons;
  var prodFunctionsModule = app.prodFunctions;
  var prodTasksModue = app.prodTasks;
  // TODO: Create a proper org unit tree solution
  var divisionsModule = app.divisions;
  var subdivisionsModule = app.subdivisions;
  var mrpControllersModule = app.mrpControllers;
  var prodFlowsModule = app.prodFlows;
  var workCentersModule = app.workCenters;
  var prodLinesModule = app.prodLines;

  var KS_MRP_RE = /^KS/;

  var canView = userModule.auth('REPORTS:VIEW');
  var canManage = userModule.auth('REPORTS:MANAGE');

  express.get('/reports/1', canView, report1Route);

  express.get('/reports/2', canView, report2Route);

  express.get('/reports/3', canView, report3Route);

  express.get(
    '/reports/metricRefs',
    canView,
    function limitToMetricRefs(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^metricRefs\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/reports/metricRefs/:id', canManage, settings.updateRoute);

  function report1Route(req, res, next)
  {
    if (req.query.orgUnitType === 'mrpController')
    {
      req.query.orgUnitType = 'mrpControllers';
    }

    var divisionId = getDivisionByOrgUnit(req.query.orgUnitType, req.query.orgUnitId);
    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'hour',
      orgUnitType: req.query.orgUnitType,
      orgUnitId: req.query.orgUnitId,
      division: divisionId,
      subdivisions: getSubdivisionsByDivision(divisionId),
      subdivisionType: req.query.subdivisionType || null,
      ignoredDowntimeReasons: [],
      prodDivisionCount: countProdDivisions()
    };

    if (isNaN(options.fromTime) || isNaN(options.toTime))
    {
      return next(new Error('INVALID_TIME'));
    }

    downtimeReasonsModule.models.forEach(function(downtimeReason)
    {
      if (downtimeReason.get('type') === 'break')
      {
        options.ignoredDowntimeReasons.push(downtimeReason.get('_id'));
      }
    });

    report1(mongoose, options, function(err, report)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(report);
    });
  }

  function report2Route(req, res, next)
  {
    if (req.query.orgUnitType === 'mrpController')
    {
      req.query.orgUnitType = 'mrpControllers';
    }

    var mrpControllers =
      getAssemblyMrpControllersByOrgUnit(req.query.orgUnitType, req.query.orgUnitId);

    if (mrpControllers === null)
    {
      return next(new Error('INVALID_ORG_UNIT'));
    }

    var divisionId = getDivisionByOrgUnit(req.query.orgUnitType, req.query.orgUnitId);
    var subdivisions = getSubdivisionsByDivision(divisionId);
    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'day',
      orgUnitType: req.query.orgUnitType,
      orgUnitId: req.query.orgUnitId,
      division: divisionId,
      subdivisions: subdivisions,
      mrpControllers: mrpControllers,
      prodFlows: getProdFlowsByOrgUnit(req.query.orgUnitType, req.query.orgUnitId),
      directProdFunctions: getDirectProdFunctions(),
      prodDivisionCount: countProdDivisions(),
      prodTasks: getProdTasks()
    };

    if (isNaN(options.fromTime) || isNaN(options.toTime))
    {
      return next(new Error('INVALID_TIME'));
    }

    report2(mongoose, options, function(err, report)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(report);
    });
  }

  function report3Route(req, res, next)
  {
    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'day',
      // TODO: Make the default value configurable
      majorMalfunction: parseFloat(req.query.majorMalfunction) || 1.5,
      downtimeReasons: getDowntimeReasons(),
      prodLines: getProdLines()
    };

    if (isNaN(options.fromTime) || isNaN(options.toTime))
    {
      return next(new Error('INVALID_TIME'));
    }

    report3(mongoose, options, function(err, report)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(report);
    });
  }

  function getTime(date)
  {
    return (/^[0-9]+$/).test(date) ? parseInt(date, 10) : Date.parse(date);
  }

  function getDivisionByOrgUnit(orgUnitType, orgUnitId)
  {
    /*jshint -W015*/

    if (!orgUnitType || !orgUnitId)
    {
      return null;
    }

    switch (orgUnitType)
    {
      case 'division':
        return orgUnitId;

      case 'subdivision':
        var subdivision = subdivisionsModule.modelsById[orgUnitId];

        return subdivision ? subdivision.get('division') : null;

      case 'mrpControllers':
      case 'mrpController':
        return getDivisionByParentOrgUnit(mrpControllersModule, orgUnitId, 'subdivision');

      case 'prodFlow':
        return getDivisionByParentOrgUnit(prodFlowsModule, orgUnitId, 'mrpController');

      case 'workCenter':
        return getDivisionByParentOrgUnit(workCentersModule, orgUnitId, 'prodFlow');

      case 'prodLine':
        return getDivisionByParentOrgUnit(prodLinesModule, orgUnitId, 'workCenter');

      default:
        return null;
    }
  }

  function getDivisionByParentOrgUnit(orgUnitsModule, orgUnitId, parentOrgUnitProperty)
  {
    var orgUnit = orgUnitsModule.modelsById[orgUnitId];

    if (!orgUnit)
    {
      return null;
    }

    var parentOrgUnit = orgUnit.get(parentOrgUnitProperty);

    if (Array.isArray(parentOrgUnit))
    {
      parentOrgUnit = parentOrgUnit[0];
    }

    return parentOrgUnit ? getDivisionByOrgUnit(parentOrgUnitProperty, parentOrgUnit) : null;
  }

  function getSubdivisionsByDivision(divisionId, type)
  {
    if (!divisionId)
    {
      return !type ? [] : subdivisionsModule.models
        .filter(function(subdivision) { return subdivision.get('type') === type; })
        .map(function(subdivision) { return subdivision.get('_id'); });
    }

    return subdivisionsModule.models
      .filter(function(subdivision)
      {
        return subdivision.get('division') === divisionId
          && (!type || subdivision.get('type') === type);
      })
      .map(function(subdivision) { return subdivision.get('_id'); });
  }

  function getAssemblyMrpControllersByOrgUnit(orgUnitType, orgUnitId)
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
                getAssemblyMrpControllersByOrgUnit('subdivision', subdivision._id.toString())
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
              && !KS_MRP_RE.test(mrpController._id);
          })
          .map(function(mrpController) { return mrpController._id; });

      case 'mrpControllers':
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
  }

  function onlyAssemblyMrpControllers(mrpControllerId)
  {
    if (KS_MRP_RE.test(mrpControllerId))
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

  function countProdDivisions()
  {
    var prodDivisionCount = 0;

    divisionsModule.models.forEach(function(division)
    {
      if (division.type === 'prod')
      {
        prodDivisionCount += 1;
      }
    });

    return prodDivisionCount;
  }

  function getProdFlowsByOrgUnit(orgUnitType, orgUnitId)
  {
    /*jshint -W015*/

    if (!orgUnitType || !orgUnitId)
    {
      return null;
    }

    switch (orgUnitType)
    {
      case 'division':
        return subdivisionsModule.models
          .filter(function(subdivision){ return subdivision.division === orgUnitId; })
          .reduce(function(prodFlows, subdivision)
          {
            return prodFlows.concat(
              getProdFlowsByOrgUnit('subdivision', subdivision._id.toString())
            );
          }, []);

      case 'subdivision':
        var subdivision = subdivisionsModule.modelsById[orgUnitId];

        if (!subdivision)
        {
          return null;
        }

        return mrpControllersModule.models
          .filter(function(mrpController)
          {
            return mrpController.subdivision && mrpController.subdivision.toString() === orgUnitId;
          })
          .reduce(function(prodFlows, mrpController)
          {
            return prodFlows.concat(getProdFlowsByOrgUnit('mrpControllers', mrpController._id));
          }, []);

      case 'mrpControllers':
        return prodFlowsModule.models
          .filter(function(prodFlow) { return prodFlow.mrpController.indexOf(orgUnitId) !== -1; })
          .map(function(prodFlow) { return prodFlow._id.toString(); });

      case 'prodFlow':
        return [orgUnitId];

      case 'workCenter':
        return null;

      case 'prodLine':
        return null;

      default:
        return null;
    }
  }

  function getDirectProdFunctions()
  {
    var prodFunctions = {};

    prodFunctionsModule.models.forEach(function(prodFunction)
    {
      if (prodFunction.direct)
      {
        prodFunctions[prodFunction._id] = true;
      }
    });

    return prodFunctions;
  }

  function getProdTasks()
  {
    var prodTasks = {};

    prodTasksModue.models.forEach(function(prodTask)
    {
      if (Array.isArray(prodTask.tags) && prodTask.tags.length)
      {
        prodTasks[prodTask._id] = {
          label: prodTask.name,
          color: prodTask.clipColor
        };
      }
    });

    return prodTasks;
  }

  function getDowntimeReasons()
  {
    var downtimeReasons = {};

    downtimeReasonsModule.models.forEach(function(downtimeReason)
    {
      downtimeReasons[downtimeReason._id] = {
        type: downtimeReason.type,
        scheduled: downtimeReason.scheduled
      };
    });

    return downtimeReasons;
  }

  function getProdLines()
  {
    var prodLines = {};

    prodLinesModule.models.forEach(function(prodLine)
    {
      var subdivision = getSubdivisionByProdLine(prodLine);

      if (!subdivision)
      {
        return;
      }

      prodLines[prodLine._id] = {
        division: subdivision.division,
        subdivisionType: subdivision.type
      };
    });

    return prodLines;
  }

  function getSubdivisionByProdLine(prodLine)
  {
    var workCenter = workCentersModule.modelsById[prodLine.workCenter];

    if (!workCenter)
    {
      return null;
    }

    var prodFlow = prodFlowsModule.modelsById[workCenter.prodFlow];

    if (!prodFlow)
    {
      return null;
    }

    var mrpController = mrpControllersModule.modelsById[[].concat(prodFlow.mrpController)[0]];

    if (!mrpController)
    {
      return null;
    }

    var subdivision = subdivisionsModule.modelsById[mrpController.subdivision];

    return subdivision || null;
  }
};
