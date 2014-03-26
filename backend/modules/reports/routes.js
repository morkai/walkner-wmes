'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var tmpdir = require('os').tmpdir;
var multipart = require('express').multipart;
var report1 = require('./report1');
var report2 = require('./report2');
var report3 = require('./report3');
var report4 = require('./report4');

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

  express.get('/reports/4', canView, report4Route);

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

  if (reportsModule.config.javaBatik)
  {
    express.post('/reports;export', canView, multipart(), exportRoute);
  }

  function exportRoute(req, res, next)
  {
    /*jshint -W015*/

    var input = req.body;
    var svg = input.svg;

    if (typeof svg !== 'string'
      || svg.length === 0
      || svg.indexOf('<!ENTITY') !== -1
      || svg.indexOf('<!DOCTYPE') !== -1)
    {
      console.log(typeof svg);
      console.log(svg.length);
      console.log(svg.indexOf('<!ENTITY'));
      console.log(svg.indexOf('<!DOCTYPE'));
      return res.send(400);
    }

    var filename = input.filename;

    if (typeof filename !== 'string' || !/^[A-Za-z0-9-_ ]+$/.test(filename))
    {
      filename = 'chart';
    }

    var typeArg = null;
    var ext = null;

    switch (input.type)
    {
      case 'image/png':
        typeArg = '-m image/png';
        ext = 'png';
        break;

      case 'image/jpeg':
        typeArg = '-m image/jpeg';
        ext = 'jpg';
        break;

      case 'application/pdf':
        typeArg = '-m application/pdf';
        ext = 'pdf';
        break;
    }

    if (typeArg === null)
    {
      res.attachment(filename + '.svg');

      return res.send(svg);
    }

    var width = parseInt(input.width, 10);

    if (isNaN(width))
    {
      width = 0;
    }

    var tmpDir = tmpdir();
    var tmpFilename = (Date.now() + Math.random()).toString();
    var tmpFile = path.join(tmpDir, tmpFilename) + '.svg';
    var outFile = path.join(tmpDir, tmpFilename + '.' + ext);

    var cmd = reportsModule.config.javaBatik + ' ' + typeArg + ' -d "' + outFile + '"';

    if (width > 0)
    {
      cmd += ' ' + width;
    }

    cmd += ' "' + tmpFile + '"';

    fs.writeFile(tmpFile, svg, 'utf8', function(err)
    {
      if (err)
      {
        return next(err);
      }

      exec(cmd, function(err, stdout, stderr)
      {
        if (err)
        {
          cleanup();

          return next(err);
        }

        if (stderr.length)
        {
          cleanup();

          return res.send(stderr, 500);
        }

        res.attachment(filename + '.' + ext);
        res.sendfile(outFile, cleanup);
      });
    });

    function cleanup()
    {
      fs.unlink(tmpFile);
      fs.unlink(outFile);
    }
  }

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
      downtimeReasons: getDowntimeReasons(false),
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

  function report4Route(req, res, next)
  {
    var options = {
      fromTime: getTime(req.query.from),
      toTime: getTime(req.query.to),
      interval: req.query.interval || 'day',
      mode: req.query.mode,
      downtimeReasons: getDowntimeReasons(true),
      subdivisions: orgUnitsModule.getAllByType('subdivision')
        .filter(function(subdivision) { return subdivision.type === 'press'; })
        .map(function(subdivision) { return subdivision._id; })
    };

    if (isNaN(options.fromTime) || isNaN(options.toTime))
    {
      return next(new Error('INVALID_TIME'));
    }

    if (options.mode === 'shift')
    {
      options.shift = parseInt(req.query.shift, 10);

      if (options.shift !== 1 && options.shift !== 2 && options.shift !== 3)
      {
        return next(new Error('INVALID_SHIFT'));
      }
    }
    else if (options.mode === 'masters' || options.mode === 'operators')
    {
      options[options.mode] = (req.query[options.mode] || '')
        .split(',')
        .filter(function(personellId) { return (/^[0-9]+$/).test(personellId); });

      if (options[options.mode].length === 0)
      {
        return next(new Error('INVALID_PERSONELL_IDS'));
      }
    }
    else
    {
      options.mode = null;
    }

    if (options.mode === 'masters' || options.mode === 'operators')
    {
      findUsers();
    }
    else
    {
      report();
    }

    function findUsers()
    {
      mongoose.model('User')
        .find(
          {personellId: {$in: options[options.mode]}},
          {_id: 1, personellId: 1, firstName: 1, lastName: 1}
        )
        .lean()
        .exec(function(err, users)
        {
          if (err)
          {
            return next(err);
          }

          if (users.length !== options[options.mode].length)
          {
            return next(new Error('NONEXISTENT_USERS'));
          }

          options[options.mode] = users;

          report();
        });
    }

    function report()
    {
      report4(mongoose, options, function(err, report)
      {
        if (err)
        {
          return next(err);
        }

        return res.send(report);
      });
    }
  }

  function getTime(date)
  {
    return (/^-?[0-9]+$/).test(date) ? parseInt(date, 10) : Date.parse(date);
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

  function getDowntimeReasons(typesOnly)
  {
    var downtimeReasons = {};

    downtimeReasonsModule.models.forEach(function(downtimeReason)
    {
      if (typesOnly)
      {
        downtimeReasons[downtimeReason._id] = downtimeReason.type;
      }
      else
      {
        downtimeReasons[downtimeReason._id] = {
          type: downtimeReason.type,
          scheduled: downtimeReason.scheduled
        };
      }
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
