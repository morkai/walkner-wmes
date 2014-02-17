'use strict';

var moment = require('moment');
var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpFteRoutes(app, fteModule)
{
  var express = app[fteModule.config.expressId];
  var auth = app[fteModule.config.userId].auth;
  var mongoose = app[fteModule.config.mongooseId];
  var subdivisionsModule = app[fteModule.config.subdivisionsId];
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var canViewLeader = auth('FTE:LEADER:VIEW');
  var canViewMaster = auth('FTE:MASTER:VIEW');

  express.get(
    '/fte/master',
    canViewMaster,
    limitToDivision,
    crud.browseRoute.bind(null, app, FteMasterEntry)
  );

  express.get('/fte/master/:id', canViewMaster, crud.readRoute.bind(null, app, FteMasterEntry));

  express.get(
    '/fte/leader',
    canViewLeader,
    limitToDivision,
    crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/leader;export',
    canViewLeader,
    function(req, res, next)
    {
      req.rql.fields = {};

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-FTE_STORAGE',
      serializeStream: exportFteLeaderEntries,
      model: FteLeaderEntry
    })
  );

  express.get('/fte/leader/:id', canViewLeader, crud.readRoute.bind(null, app, FteLeaderEntry));

  function limitToDivision(req, res, next)
  {
    var selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    var divisionTerm = lodash.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'division';
    });

    if (!divisionTerm)
    {
      return next();
    }

    var subdivisions = [];

    subdivisionsModule.models.forEach(function(subdivisionModel)
    {
      if (subdivisionModel.get('division') === divisionTerm.args[1])
      {
        subdivisions.push(subdivisionModel.get('_id').toString());
      }
    });

    divisionTerm.name = 'in';
    divisionTerm.args = ['subdivision', subdivisions];

    next();
  }

  function exportFteLeaderEntries(queryStream, emitter)
  {
    var docs = [];
    var companyMap = {};
    var divisionMap = {};
    var companyList = [];
    var divisionList = [];

    queryStream.on('error', emitter.emit.bind(emitter, 'error'));

    queryStream.on('close', function()
    {
      companyList = Object.keys(companyMap);
      divisionList = Object.keys(divisionMap);
      companyMap = null;
      divisionMap = null;

      tryExportNext();
    });

    queryStream.on('data', function(doc)
    {
      doc.tasks.forEach(function(task)
      {
        var taskCompanyMap = {};

        task.companies.forEach(function(company)
        {
          companyMap[company.id] = true;
          taskCompanyMap[company.id] = company;

          if (typeof company.count === 'number')
          {
            company.total = company.count;
          }
          else
          {
            company.total = 0;

            var taskDivisionMap = {};

            company.count.forEach(function(taskDivision)
            {
              company.total += taskDivision.value;
              taskDivisionMap[taskDivision.division] = taskDivision.value;
            });

            company.count = taskDivisionMap;
          }
        });

        task.companies = taskCompanyMap;
      });

      if (Array.isArray(doc.fteDiv))
      {
        doc.fteDiv.forEach(function(division)
        {
          divisionMap[division] = true;
        });
      }

      docs.push(doc);
    });

    function tryExportNext()
    {
      var i = 0;

      while (i++ < 100 && docs.length > 0)
      {
        exportNext(docs.shift());
      }

      if (docs.length === 0)
      {
        emitter.emit('close');
      }
      else
      {
        setImmediate(tryExportNext);
      }
    }

    function exportNext(doc)
    {
      var date = moment(doc.date).format('YYYY-MM-DD');
      var subdivision = subdivisionsModule.modelsById[doc.subdivision];
      var division = subdivision ? subdivision.division : '?';

      subdivision = subdivision ? subdivision.name : doc.subdivision;

      for (var i = 0, l = doc.tasks.length; i < l; ++i)
      {
        var task = doc.tasks[i];
        var row = {
          '"division': division,
          '"subdivision': subdivision,
          'date': date,
          'shiftNo': doc.shift,
          '"task': task.name
        };

        exportCountColumns(row, task, companyList, divisionList);

        row['"fteId'] = doc._id;

        emitter.emit('data', row);
      }
    }
  }

  function exportCountColumns(row, task, companyList, divisionList)
  {
    var companyHd;
    var divisionHd;
    var ii;
    var ll;

    if (divisionList.length === 0)
    {
      for (ii = 0, ll = companyList.length; ii < ll; ++ii)
      {
        companyHd = companyList[ii];

        row['#' + companyHd] = task.companies[companyHd] === undefined
          ? 0
          : task.companies[companyHd].count;
      }

      return;
    }

    for (ii = 0, ll = companyList.length; ii < ll; ++ii)
    {
      companyHd = companyList[ii];

      row['#' + companyHd] = task.companies[companyHd] === undefined
        ? 0
        : task.companies[companyHd].total;

      for (var iii = 0, lll = divisionList.length; iii < lll; ++iii)
      {
        divisionHd = divisionList[iii];

        row['#' + companyHd + '[' + divisionHd + ']'] =
          getCompanyDivisionCount(task, companyHd, divisionHd);
      }
    }
  }

  function getCompanyDivisionCount(task, companyHd, divisionHd)
  {
    if (task.companies[companyHd] === undefined)
    {
      return 0;
    }

    var taskCompany = task.companies[companyHd];

    if (typeof taskCompany.count[divisionHd] === 'number')
    {
      return taskCompany.count[divisionHd];
    }

    return 0;
  }
};
