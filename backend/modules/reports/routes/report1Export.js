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

  if (!query.from || !query.to)
  {
    const firstShiftMoment = moment();

    if (firstShiftMoment.hours() >= 0 && firstShiftMoment.hours() < 6)
    {
      firstShiftMoment.subtract(1, 'days');
    }

    firstShiftMoment.hours(6).startOf('hour');

    query.from = firstShiftMoment.toISOString();
    query.to = firstShiftMoment.add(1, 'days').toISOString();
  }

  const options = {
    orgUnitType: query.orgUnitType,
    orgUnitId: query.orgUnitId,
    fromTime: helpers.getTime(query.from),
    toTime: helpers.getTime(query.to),
    interval: helpers.getInterval(query.interval === 'hour' ? 'day' : query.interval, 'day'),
    ignoredOrgUnits: helpers.decodeOrgUnits(orgUnitsModule, query.ignoredOrgUnits)
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  const {frontendAppData} = app.options;

  if (frontendAppData && frontendAppData.PRODUCTION_DATA_START_DATE)
  {
    const startMoment = moment(frontendAppData.PRODUCTION_DATA_START_DATE, 'YYYY-MM-DD');
    const fromMoment = moment(options.fromTime);

    if (startMoment.valueOf() > fromMoment.valueOf())
    {
      fromMoment
        .startOf('month')
        .year(startMoment.year())
        .month(startMoment.month())
        .date(startMoment.date());

      options.fromTime = fromMoment.valueOf();
    }
  }

  const timeDiff = options.toTime - options.fromTime;
  const year = 366 * 3600 * 24 * 1000;

  if (timeDiff > year)
  {
    options.interval = 'day';

    if (timeDiff > year * 3 && options.interval === 'day')
    {
      options.interval = 'week';
    }
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
    division: 1,
    subdivision: 1,
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
      column.type = 'percent';
      column.width = 5;
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
        width: 15,
        caption: 'Assembly line name - MES'
      },
      total: {
        type: 'percent',
        width: 5,
        caption: 'Total'
      }
    },
    serializeStream: (cursor, emitter) =>
    {
      const results = {
        prodLines: {},
        groups: {},
        lastDivision: '',
        lastSubdivision: ''
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
      const lineOrgUnits = orgUnitsModule.getAllForProdLine(pso.prodLine);
      const subdivision = orgUnitsModule.getByTypeAndId('subdivision', lineOrgUnits.subdivision);
      const prodFlow = orgUnitsModule.getByTypeAndId('prodFlow', lineOrgUnits.prodFlow);

      results.prodLines[pso.prodLine] = {
        division: {
          _id: lineOrgUnits.division,
          label: String(lineOrgUnits.division)
        },
        subdivision: {
          _id: lineOrgUnits.subdivision,
          label: subdivision ? subdivision.name : String(lineOrgUnits.subdivision)
        },
        mrpControllers: {
          _id: lineOrgUnits.mrpControllers,
          label: lineOrgUnits.mrpControllers ? lineOrgUnits.mrpControllers.join('; ') : '?'
        },
        prodFlow: {
          _id: lineOrgUnits.prodFlow,
          label: prodFlow ? prodFlow.name : String(lineOrgUnits.prodFlow)
        },
        workCenter: {
          _id: lineOrgUnits.workCenter,
          label: String(lineOrgUnits.workCenter)
        },
        prodLine: {
          _id: pso.prodLine,
          label: pso.prodLine
        }
      };
    }

    const group = results.groups[groupKey];

    if (!group[pso.division])
    {
      group[pso.division] = {
        effNum: 0,
        effDen: 0
      };
    }

    if (!group[pso.subdivision])
    {
      group[pso.subdivision] = {
        effNum: 0,
        effDen: 0
      };
    }

    if (!group[pso.prodLine])
    {
      group[pso.prodLine] = {
        effNum: 0,
        effDen: 0
      };
    }

    if (!group[pso.prodLine])
    {
      group[pso.prodLine] = {
        effNum: 0,
        effDen: 0
      };
    }

    const effNum = pso.laborTime / 100 * pso.totalQuantity;
    const effDen = pso.workDuration * pso.workerCount;

    group[pso.division].effNum += effNum;
    group[pso.division].effDen += effDen;
    group[pso.subdivision].effNum += effNum;
    group[pso.subdivision].effDen += effDen;
    group[pso.prodLine].effNum += effNum;
    group[pso.prodLine].effDen += effDen;
  }

  function sendResults(results, emitter)
  {
    const prodLines = Object.keys(results.prodLines);
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

    prodLines.sort((a, b) => sortLinesBy(
      ['division', 'subdivision', 'prodLine'],
      results.prodLines[a],
      results.prodLines[b]
    ));

    emitNextProdLine(prodLines, groups, results, emitter);
  }

  function sortLinesBy(properties, a, b)
  {
    const property = properties.shift();

    if (property === null)
    {
      return 0;
    }

    const cmp = a[property].label.localeCompare(b[property].label, undefined, {numeric: true});

    return cmp === 0 ? sortLinesBy(properties, a, b) : cmp;
  }

  function emitNextProdLine(prodLines, groups, results, emitter)
  {
    if (prodLines.length === 0)
    {
      return emitter.emit('end');
    }

    const prodLine = prodLines.shift();
    const lineOrgUnits = results.prodLines[prodLine];

    if (lineOrgUnits.division._id !== results.lastDivision)
    {
      const divisionOrgUnits = {division: lineOrgUnits.division};

      emitOrgUnitRow('division', divisionOrgUnits, groups, results, emitter);

      results.lastDivision = lineOrgUnits.division._id;
    }

    if (lineOrgUnits.subdivision._id !== results.lastSubdivision)
    {
      const subdivisionOrgUnits = {division: lineOrgUnits.division, subdivision: lineOrgUnits.subdivision};

      emitOrgUnitRow('subdivision', subdivisionOrgUnits, groups, results, emitter);

      results.lastSubdivision = lineOrgUnits.subdivision._id;
    }

    emitOrgUnitRow('prodLine', lineOrgUnits, groups, results, emitter);

    setImmediate(emitNextProdLine, prodLines, groups, results, emitter);
  }

  function emitOrgUnitRow(orgUnitType, orgUnits, groups, results, emitter)
  {
    const row = {
      division: orgUnits.division.label,
      subdivision: orgUnits.subdivision ? orgUnits.subdivision.label : '',
      mrpControllers: orgUnits.mrpControllers ? orgUnits.mrpControllers.label : '',
      prodFlow: orgUnits.prodFlow ? orgUnits.prodFlow.label : '',
      workCenter: orgUnits.workCenter ? orgUnits.workCenter.label : '',
      prodLine: orgUnits.prodLine ? orgUnits.prodLine.label : ''
    };

    let totalEffNum = 0;
    let totalEffDen = 0;

    groups.forEach(group =>
    {
      const data = (results.groups[group.key] || {})[orgUnits[orgUnitType]._id] || {
        effNum: 0,
        effDen: 0
      };

      totalEffNum += data.effNum;
      totalEffDen += data.effDen;

      row[group.label] = data.effDen > 0 ? Math.round(data.effNum / data.effDen * 100) / 100 : 0;
    });

    row.total = totalEffDen > 0 ? Math.round(totalEffNum / totalEffDen * 100) / 100 : 0;

    emitter.emit('data', row);
  }
};
