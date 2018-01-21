// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');
const exportFteLeaderEntries = require('./exportFteLeaderEntries');
const canManage = require('./canManage');

const WH_DIVISION = 'LD'; // TODO ???

module.exports = function setUpFteRoutes(app, fteModule)
{
  const express = app[fteModule.config.expressId];
  const auth = app[fteModule.config.userId].auth;
  const mongoose = app[fteModule.config.mongooseId];
  const subdivisionsModule = app[fteModule.config.subdivisionsId];
  const settings = app[fteModule.config.settingsId];
  const FteMasterEntry = mongoose.model('FteMasterEntry');
  const FteLeaderEntry = mongoose.model('FteLeaderEntry');

  const canManageSettings = auth('PROD_DATA:MANAGE');
  const canViewMaster = auth('FTE:MASTER:VIEW');
  const canViewLeader = auth('FTE:LEADER:VIEW');
  const canViewWh = auth('FTE:WH:VIEW');
  const canExportWh = auth('FTE:WH:VIEW', 'REPORTS:VIEW', 'REPORTS:6:VIEW');

  // Settings
  express.get(
    '/fte/settings',
    canManageSettings,
    limitToFteSettings,
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/fte/settings/:id', canManageSettings, settings.updateRoute);

  // Production
  express.get(
    '/fte/master',
    canViewMaster,
    limitToDivision.bind(null, null),
    express.crud.browseRoute.bind(null, app, FteMasterEntry)
  );

  express.get(
    '/fte/master;export.:format?',
    canViewMaster,
    limitToDivision.bind(null, null),
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
    canDelete.bind(null, FteMasterEntry, 'MASTER'),
    express.crud.deleteRoute.bind(null, app, FteMasterEntry)
  );

  // Other
  express.get(
    '/fte/leader',
    canViewWh,
    limitToDivision.bind(null, limitToOther),
    express.crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/leader;export.:format?',
    canViewLeader,
    limitToDivision.bind(null, limitToOther),
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-FTE_OTHER',
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
    canDelete.bind(null, FteLeaderEntry, 'LEADER'),
    express.crud.deleteRoute.bind(null, app, FteLeaderEntry)
  );

  // Warehouse
  express.get(
    '/fte/wh',
    canViewLeader,
    limitToDivision.bind(null, limitToWarehouse),
    express.crud.browseRoute.bind(null, app, FteLeaderEntry)
  );

  express.get(
    '/fte/wh;export.:format?',
    canExportWh,
    limitToDivision.bind(null, limitToWarehouse),
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

  express.get('/fte/wh/:id', canViewLeader, readFteEntryRoute.bind(null, 'leader'));

  express.delete(
    '/fte/wh/:id',
    canDelete.bind(null, FteLeaderEntry, 'WH'),
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

  function limitToDivision(limitToSubdivisions, req, res, next)
  {
    const selector = req.rql.selector.args;
    const divisionTerm = _.find(selector, term => term.name === 'eq' && term.args[0] === 'division');
    const subdivisionTerm = _.find(selector, term => term.name !== 'select' && term.args[0] === 'subdivision');
    const subdivisions = [];

    if (divisionTerm)
    {
      _.pull(selector, divisionTerm);

      _.forEach(subdivisionsModule.models, function(subdivisionModel)
      {
        if (subdivisionModel.division === divisionTerm.args[1])
        {
          subdivisions.push(subdivisionModel._id.toString());
        }
      });
    }
    else if (subdivisionTerm)
    {
      return next();
    }
    else if (limitToSubdivisions)
    {
      limitToSubdivisions(subdivisions);
    }

    if (subdivisions.length)
    {
      selector.push({
        name: 'in',
        args: ['subdivision', subdivisions]
      });
    }

    next();
  }

  function limitToOther(subdivisions)
  {
    subdivisionsModule.models.forEach(s =>
    {
      if (s.division !== WH_DIVISION)
      {
        subdivisions.push(s._id.toString());
      }
    });
  }

  function limitToWarehouse(subdivisions)
  {
    subdivisionsModule.models.forEach(s =>
    {
      if (s.division === WH_DIVISION)
      {
        subdivisions.push(s._id.toString());
      }
    });
  }

  function canDelete(FteEntry, entryType, req, res, next)
  {
    FteEntry.findById(req.params.id).exec(function(err, fteEntry)
    {
      if (err)
      {
        return next(err);
      }

      req.model = fteEntry;

      if (fteEntry && !canManage(req.session.user, fteEntry, entryType))
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

      row.fteId = fteId;

      rows.push(row);
    });

    return rows;
  }
};
