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
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
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
    var orgUnit = orgUnitsModule.getByTypeAndId(req.query.orgUnitType, req.query.orgUnitId);

    if (orgUnit === null && (req.query.orgUnitType || req.query.orgUnitId))
    {
      return res.send(400);
    }

    var division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

    if (orgUnit !== null && !division)
    {
      return res.send(400);
    }

    var subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;

    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'hour',
      orgUnitType: orgUnit ? req.query.orgUnitType : null,
      orgUnitId: orgUnit ? req.query.orgUnitId : null,
      division: idToStr(division),
      subdivisions: idToStr(subdivisions),
      subdivisionType: req.query.subdivisionType || null,
      prodFlows: idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
      orgUnits: getOrgUnitsForFte(req.query.orgUnitType, orgUnit),
      ignoredDowntimeReasons: idToStr(downtimeReasonsModule.models.filter(function(downtimeReason)
      {
        return downtimeReason.type === 'break';
      }))
    };

    if (isNaN(options.fromTime) || isNaN(options.toTime))
    {
      return next(new Error('INVALID_TIME'));
    }

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
    var orgUnit = orgUnitsModule.getByTypeAndId(req.query.orgUnitType, req.query.orgUnitId);

    if (orgUnit === null && (req.query.orgUnitType || req.query.orgUnitId))
    {
      return res.send(400);
    }

    var division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

    if (orgUnit !== null && !division)
    {
      return res.send(400);
    }

    var mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(
      req.query.orgUnitType, req.query.orgUnitId
    );

    if (mrpControllers === null)
    {
      return next(new Error('INVALID_ORG_UNIT'));
    }

    var subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;

    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'day',
      orgUnitType: orgUnit ? req.query.orgUnitType : null,
      orgUnitId: orgUnit ? req.query.orgUnitId : null,
      division: idToStr(division),
      subdivisions: idToStr(subdivisions),
      mrpControllers: mrpControllers,
      prodFlows: idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
      orgUnits: getOrgUnitsForFte(req.query.orgUnitType, orgUnit),
      directProdFunctions: getDirectProdFunctions(),
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

  function getOrgUnitsForFte(orgUnitType, orgUnit)
  {
    /*jshint -W015*/

    var orgUnits = {
      tasks: null,
      flows: null
    };

    switch (orgUnitType)
    {
      case 'subdivision':
        orgUnits.tasks = idToStr(orgUnitsModule.getSubdivisionsFor('division', orgUnit.division));
        break;

      case 'mrpController':
      case 'prodFlow':
      case 'workCenter':
      case 'prodLine':
        orgUnits.tasks = idToStr(orgUnitsModule.getAllByTypeForSubdivision(
          orgUnitType, orgUnitsModule.getSubdivisionFor(orgUnit)
        ));

        if (orgUnitType === 'workCenter')
        {
          orgUnits.flows = idToStr(orgUnitsModule.getWorkCentersInProdFlow(
            orgUnitsModule.getByTypeAndId('prodFlow', orgUnit.prodFlow)
          ));
        }
        else if (orgUnitType === 'prodLine')
        {
          orgUnits.flows = idToStr(orgUnitsModule.getProdLinesInProdFlow(
            orgUnitsModule.getParent(orgUnitsModule.getParent(orgUnit))
          ));
        }
        break;
    }

    return orgUnits;
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

  function idToStr(input)
  {
    if (Array.isArray(input))
    {
      return input.map(function(model) { return String(model._id); });
    }

    if (input === null)
    {
      return null;
    }

    return String(input._id);
  }
};
