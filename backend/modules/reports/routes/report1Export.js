// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const util = require('../util');
const helpers = require('./helpers');

const HOUR_TO_SHIFT = {
  6: ' I',
  14: ' II',
  22: ' III'
};

module.exports = function report1ExportRoute(app, reportsModule, req, res, next)
{
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const express = app[reportsModule.config.expressId];
  const mongoose = app[reportsModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const query = req.query;
  const orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  const options = {
    orgUnitType: query.orgUnitType,
    orgUnitId: query.orgUnitId,
    fromTime: helpers.getTime(query.from),
    toTime: helpers.getTime(query.to),
    interval: helpers.getInterval(query.interval, 'shift'),
    ignoredOrgUnits: helpers.decodeOrgUnits(orgUnitsModule, query.ignoredOrgUnits)
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  const conditions = {
    startedAt: {
      $gte: options.fromTime,
      $lt: options.toTime
    },
    workDuration: {$ne: 0},
    laborTime: {$ne: 0},
    workerCount: {$ne: 0},
    finishedAt: {$ne: null}
  };

  if (query.orgUnitType && options.orgUnitId)
  {
    const orgUnitProperty = options.orgUnitType === 'mrpController'
      ? 'mrpControllers'
      : options.orgUnitType;

    conditions[orgUnitProperty] = options.orgUnitId;
  }

  if (!options.ignoredOrgUnits.empty)
  {
    conditions.prodLine = {$nin: Object.keys(options.ignoredOrgUnits.prodLine)};
  }

  const fields = {
    prodLine: 1,
    startedAt: 1,
    workDuration: 1,
    workerCount: 1,
    totalQuantity: 1,
    laborTime: 1
  };

  express.crud.exportRoute(app, {
    cursor: ProdShiftOrder.find(conditions, fields).lean().cursor(),
    serializeRow: () => {},
    filename: 'WMES-LINE_EFFICIENCY',
    freezeRows: 1,
    freezeColumns: 6,
    headerHeight: options.interval === 'shift' ? 72 : 60,
    prepareColumn: column =>
    {
      column.type = 'integer';
      column.width = 4;
      column.headerRotation = 90;
      column.headerAlignmentH = 'Center';
      column.headerAlignmentV = 'Bottom';
    },
    columns: {
      division: {
        width: 12,
        caption: 'Prod. center'
      },
      subdivision: {
        width: 12,
        caption: 'Prod. area'
      },
      mrpControllers: {
        width: 10,
        caption: 'MRP - MES'
      },
      prodFlow: {
        width: 35,
        caption: 'Product Segment'
      },
      workCenter: {
        width: 15,
        caption: 'Work Center'
      },
      prodLine: {
        width: 13,
        caption: 'Assembly line name - MES'
      }
    },
    serializeStream: (cursor, emitter) =>
    {
      const results = {
        prodLines: {},
        groups: {}
      };

      cursor.on('error', err => emitter.emit('error', err));

      cursor.on('end', sendResults.bind(null, results, emitter));

      cursor.on('data', serializeRow.bind(null, results));
    }
  }, req, res, next);

  function serializeRow(results, pso)
  {
    const groupKey = util.createGroupKey(options.interval, pso.startedAt, true);

    if (!results.groups[groupKey])
    {
      results.groups[groupKey] = {};
    }

    if (!results.prodLines[pso.prodLine])
    {
      results.prodLines[pso.prodLine] = orgUnitsModule.getAllForProdLine(pso.prodLine);
    }

    if (!results.groups[groupKey][pso.prodLine])
    {
      results.groups[groupKey][pso.prodLine] = {
        effNum: 0,
        effDen: 0
      };
    }

    results.groups[groupKey][pso.prodLine].effNum += pso.laborTime / 100 * pso.totalQuantity;
    results.groups[groupKey][pso.prodLine].effDen += pso.workDuration * pso.workerCount;
  }

  function sendResults(results, emitter)
  {
    const prodLines = Object.keys(results.prodLines).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
    const groupKeys = Object.keys(results.groups).map(k => +k).sort();
    const groups = [];
    const shiftInterval = options.interval === 'shift';
    const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
    const lastGroupKey = groupKeys[groupKeys.length - 1];
    let currentGroupKey = groupKeys[0];

    while (currentGroupKey <= lastGroupKey)
    {
      const m = moment(currentGroupKey);

      groups.push({
        key: currentGroupKey,
        label: m.format('L') + (shiftInterval ? HOUR_TO_SHIFT[m.hours()] : '')
      });

      currentGroupKey = createNextGroupKey(currentGroupKey);
    }

    emitNextProdLine(prodLines, groups, results, emitter);
  }

  function emitNextProdLine(prodLines, groups, results, emitter)
  {
    if (prodLines.length === 0)
    {
      return emitter.emit('end');
    }

    const orgUnits = results.prodLines[prodLines.shift()];
    const subdivision = orgUnitsModule.getByTypeAndId('subdivision', orgUnits.subdivision);
    const prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', orgUnits.prodFlow);
    const row = {
      division: orgUnits.division,
      subdivision: subdivision ? subdivision.name : String(orgUnits.subdivision),
      mrpControllers: orgUnits.mrpControllers.join('; '),
      prodFlow: prodFlow ? prodFlow.name : String(orgUnits.prodFlow),
      workCenter: orgUnits.workCenter,
      prodLine: orgUnits.prodLine
    };

    groups.forEach(group =>
    {
      const data = (results.groups[group.key] || {})[orgUnits.prodLine] || {
        effNum: 0,
        effDen: 0
      };

      row[group.label] = data.effDen > 0 ? Math.round(data.effNum / data.effDen * 100) : 0;
    });

    emitter.emit('data', row);

    setImmediate(emitNextProdLine, prodLines, groups, results, emitter);
  }
};
