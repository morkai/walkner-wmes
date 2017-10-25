// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');
const exportFteLeaderEntries = require('./exportFteLeaderEntries');
const canManage = require('./canManage');

module.exports = function setUpFteRoutes(app, fteModule)
{
  const express = app[fteModule.config.expressId];
  const auth = app[fteModule.config.userId].auth;
  const mongoose = app[fteModule.config.mongooseId];
  const subdivisionsModule = app[fteModule.config.subdivisionsId];
  const settings = app[fteModule.config.settingsId];
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const canViewLeader = auth('FTE:LEADER:VIEW');
  const canViewMaster = auth('FTE:MASTER:VIEW');
  const canManageSettings = auth('PROD_DATA:MANAGE');

  express.get(
    '/fte/settings',
    canManageSettings,
    limitToFteSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/fte/settings/:id', canManageSettings, settings.updateRoute);

  express.get(
    '/fte/master',
    canViewMaster,
    limitToDivision,
    express.crud.browseRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/master;export.:format?',
    canViewMaster,
    limitToDivision,
    prepareFteMasterEntryExport,
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-FTE_PRODUCTION',
      batchSize: 2,
      freezeRows: 1,
      columns: {
        division: 8,
        subdivision: 10,
        date: 'date',
        shift: {
          type: 'integer',
          width: 5
        },
        type: 10,
        task: 20
      },
      serializeRow: serializeFteMasterEntry,
      model: FteMasterEntry
    })
  );

  express.get('/fte/master/:id', canViewMaster, readFteEntryRoute.bind(null, 'master'));

  express.delete(
    '/fte/master/:id',
    canDelete.bind(null, FteMasterEntry),
    express.crud.deleteRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/leader',
    canViewLeader,
    limitToDivision,
    express.crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/leader;export.:format?',
    auth('FTE:LEADER:VIEW', 'REPORTS:VIEW'),
    limitToDivision,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-FTE_WAREHOUSE',
      freezeRows: 1,
      columns: {
        division: 8,
        subdivision: 20,
        date: 'date',
        shift: {
          type: 'integer',
          width: 5
        },
        task: 40,
        parent: 'boolean'
      },
      serializeStream: exportFteLeaderEntries.bind(null, app, subdivisionsModule),
      model: FteLeaderEntry
    })
  );

  express.get('/fte/leader/:id', canViewLeader, readFteEntryRoute.bind(null, 'leader'));

  express.delete(
    '/fte/leader/:id',
    canDelete.bind(null, FteLeaderEntry),
    express.crud.deleteRoute.bind(null, app, FteLeaderEntry)
  );

  function limitToFteSettings(req, res, next)
  {
    req.rql.selector = {
      name: 'regex',
      args: ['_id', '^fte\\.']
    };

    return next();
  }

  function limitToDivision(req, res, next)
  {
    const selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    const divisionTerm = _.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'division';
    });

    if (!divisionTerm)
    {
      return next();
    }

    const subdivisions = [];

    _.forEach(subdivisionsModule.models, function(subdivisionModel)
    {
      if (subdivisionModel.division === divisionTerm.args[1])
      {
        subdivisions.push(subdivisionModel._id.toString());
      }
    });

    divisionTerm.name = 'in';
    divisionTerm.args = ['subdivision', subdivisions];

    next();
  }

  function canDelete(FteEntry, req, res, next)
  {
    FteEntry.findById(req.params.id).exec(function(err, fteEntry)
    {
      if (err)
      {
        return next(err);
      }

      req.model = fteEntry;

      if (fteEntry && !canManage(req.session.user, fteEntry))
      {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  function readFteEntryRoute(type, req, res, next)
  {
    fteModule.getCachedEntry(type, req.params.id, function(err, fteEntry)
    {
      if (err)
      {
        return next(err);
      }

      if (!fteEntry)
      {
        return res.sendStatus(404);
      }

      return res.json(fteEntry);
    });
  }

  function prepareFteMasterEntryExport(req, res, next)
  {
    req.rql.fields = {};
    req.rql.sort = {};

    const {selector} = mongoSerializer.fromQuery(req.rql);

    if (selector.subdivision)
    {
      if (selector.subdivision.$in)
      {
        selector.subdivision.$in = selector.subdivision.$in.map(id => new mongoose.Types.ObjectId(id));
      }
      else if (_.isString(selector.subdivision))
      {
        selector.subdivision = new mongoose.Types.ObjectId(selector.subdivision);
      }
    }

    _.forEach(selector.date, (v, k) =>
    {
      if (_.isNumber(v))
      {
        selector.date[k] = new Date(v);
      }
    });

    const pipeline = [
      {$match: selector},
      {$unwind: '$tasks'},
      {$unwind: '$tasks.functions'},
      {$unwind: '$tasks.functions.companies'},
      {$group: {
        _id: {
          prodFunction: '$tasks.functions.id',
          company: '$tasks.functions.companies.id'
        }
      }}
    ];

    FteMasterEntry.aggregate(pipeline, (err, results) =>
    {
      if (err)
      {
        return next(err);
      }

      const prodFunctions = {};
      const companies = {};

      results.forEach(r =>
      {
        if (!prodFunctions[r._id.prodFunction])
        {
          prodFunctions[r._id.prodFunction] = {};
        }

        prodFunctions[r._id.prodFunction][r._id.company] = true;
        companies[r._id.company] = true;
      });

      _.forEach(prodFunctions, (companies, k) =>
      {
        prodFunctions[k] = Object.keys(companies);
      });

      req.dictionaries = {
        functionToCompanies: prodFunctions,
        functionList: Object.keys(prodFunctions).sort(),
        companyList: Object.keys(companies).sort()
      };

      next();
    });
  }

  function serializeFteMasterEntry(doc, req)
  {
    if (!doc.tasks || doc.tasks.length === 0)
    {
      return;
    }

    const rows = [];
    const fteId = doc._id.toString();
    const subdivision = subdivisionsModule.modelsById[doc.subdivision];
    const divisionLabel = subdivision ? subdivision.division : '?';
    const subdivisionLabel = subdivision ? subdivision.name : doc.subdivision;
    const indexMap = {};

    _.forEach(doc.tasks[0].demand, (demand, i) => indexMap[demand.id] = i);

    doc.tasks[0].functions.forEach((taskFunction, functionIndex) =>
    {
      indexMap[taskFunction.id] = {
        index: functionIndex,
        companies: {}
      };

      taskFunction.companies.forEach((taskCompany, companyIndex) =>
      {
        indexMap[taskFunction.id].companies[taskCompany.id] = companyIndex;
      });
    });

    doc.tasks.forEach(task =>
    {
      const row = {
        division: divisionLabel,
        subdivision: subdivisionLabel,
        date: doc.date,
        shift: doc.shift,
        type: task.type,
        task: task.name
      };

      req.dictionaries.companyList.forEach(companyId =>
      {
        const index = indexMap[companyId];

        row[`$demand[${companyId}]`] = index === undefined || !task.demand || !task.demand[index]
          ? 0
          : task.demand[index].count;
      });

      req.dictionaries.functionList.forEach(functionId =>
      {
        const functionIndex = indexMap[functionId];

        req.dictionaries.functionToCompanies[functionId].forEach(companyId =>
        {
          const column = `$supply[${functionId}][${companyId}]`;

          if (!functionIndex)
          {
            row[column] = 0;

            return;
          }

          const taskFunction = task.functions[functionIndex.index];

          if (!taskFunction)
          {
            row[column] = 0;

            return;
          }

          const companyIndex = functionIndex.companies[companyId];
          const taskCompany = taskFunction.companies[companyIndex];

          row[column] = taskCompany ? taskCompany.count : 0;
        });
      });

      req.dictionaries.companyList.forEach(companyId =>
      {
        const index = indexMap[companyId];

        row[`$shortage[${companyId}]`] = index === undefined || !task.shortage || !task.shortage[index]
          ? 0
          : task.shortage[index].count;
      });

      row.fteId = fteId;

      rows.push(row);
    });

    return rows;
  }
};
