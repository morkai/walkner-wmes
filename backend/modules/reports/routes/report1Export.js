// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');
const util = require('../util');
const helpers = require('./helpers');
const calcFte = require('../calcFte');

const HOUR_TO_SHIFT = {
  6: ' I',
  14: ' II',
  22: ' III'
};

module.exports = function report1ExportRoute(app, reportsModule, req, res, next)
{
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const prodTasksModule = app[reportsModule.config.prodTasksId];
  const express = app[reportsModule.config.expressId];
  const mongoose = app[reportsModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const query = req.query;
  const orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  const division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;

  if (orgUnit !== null && !division)
  {
    return res.sendStatus(400);
  }

  let subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;
  let subdivisionType = query.subdivisionType;

  if (subdivisionType === 'prod' || subdivisionType === 'press')
  {
    subdivisions = filterSubdivisionByType(
      orgUnitsModule,
      subdivisions,
      subdivisionType === 'press' ? 'press' : 'assembly'
    );
  }
  else
  {
    subdivisionType = null;
  }

  const subdivisionTypes = {};

  orgUnitsModule.getAllByType('subdivision').forEach(subdivision =>
  {
    subdivisionTypes[subdivision._id] = subdivision.type;
  });

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
    division: helpers.idToStr(division),
    subdivisions: helpers.idToStr(subdivisions),
    subdivisionTypes,
    prodFlows: helpers.idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
    orgUnits: helpers.getOrgUnitsForFte(orgUnitsModule, query.orgUnitType, orgUnit),
    fromTime: helpers.getTime(query.from),
    toTime: helpers.getTime(query.to),
    interval: helpers.getInterval(query.interval === 'hour' ? 'day' : query.interval, 'day'),
    ignoredOrgUnits: helpers.decodeOrgUnits(orgUnitsModule, query.ignoredOrgUnits),
    prodTasks: helpers.getProdTasksWithTags(prodTasksModule.models),
    byOrgUnit: {}
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

  step(
    function()
    {
      const cachedFte = helpers.getCachedReport('fte', req);
      const nextStep = this.next();

      if (cachedFte)
      {
        return setImmediate(nextStep, null, cachedFte);
      }

      const prodLines = orgUnit
        ? orgUnitsModule.getProdLinesFor(orgUnit)
        : [].concat(orgUnitsModule.getAllByType('prodLine'));

      createNextOptionsByOrgUnit(prodLines, () =>
      {
        helpers.generateReport(app, reportsModule, calcFte, 'fte', req.reportHash, options, nextStep);
      });
    },
    function(err, cachedFte)
    {
      if (err)
      {
        return this.skip(err);
      }

      try
      {
        this.fteByOrgUnit = JSON.parse(cachedFte).byOrgUnit;
      }
      catch (err)
      {
        return this.skip(err);
      }
    },
    function(err)
    {
      if (err)
      {
        return next(err);
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
        freezeRows: 2,
        freezeColumns: 6,
        subHeader: true,
        prepareColumn: column =>
        {
          column.type = 'percent';
          column.width = 6;
          column.headerAlignmentH = 'Center';
          column.headerAlignmentV = 'Bottom';

          const suffixIndex = column.caption.indexOf('$');

          if (suffixIndex === -1)
          {
            return;
          }

          const suffix = column.caption.substring(suffixIndex);

          column.caption = suffix === '$PROD' ? '' : column.caption.substring(0, suffixIndex);

          if (suffix === '$EFF')
          {
            column.mergeH = 1;
            column.fontColor = '#008000';
          }
          else
          {
            column.fontColor = '#E36B0A';
          }
        },
        columns: {
          division: {
            width: 12,
            caption: 'Prod. center',
            mergeV: 1
          },
          subdivision: {
            width: 12,
            caption: 'Prod. area',
            mergeV: 1
          },
          mrpControllers: {
            width: 10,
            caption: 'MRP - MES',
            mergeV: 1
          },
          prodFlow: {
            width: 35,
            caption: 'Product Segment',
            mergeV: 1
          },
          workCenter: {
            width: 15,
            caption: 'Work Center',
            mergeV: 1
          },
          prodLine: {
            width: 15,
            caption: 'Assembly line name - MES',
            mergeV: 1
          },
          total$EFF: {
            type: 'percent',
            width: 6,
            caption: 'Total',
            headerAlignmentH: 'Center',
            mergeH: 1,
            fontColor: '#008000'
          },
          total$PROD: {
            type: 'percent',
            width: 6,
            caption: '',
            fontColor: '#E36B0A'
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

          cursor.on('data', serializeRow.bind(null, results, this.fteByOrgUnit));
        }
      }, req, res, next);
    }
  );

  function createNextOptionsByOrgUnit(prodLines, done)
  {
    const prodLine = prodLines.shift();

    if (!prodLine)
    {
      return setImmediate(done);
    }

    const lineOrgUnits = orgUnitsModule.getAllForProdLine(prodLine);

    createOptionsByOrgUnit('prodLine', prodLine._id);

    if (lineOrgUnits.subdivision)
    {
      createOptionsByOrgUnit('subdivision', helpers.idToStr(lineOrgUnits.subdivision));
    }

    if (lineOrgUnits.subdivision)
    {
      createOptionsByOrgUnit('division', lineOrgUnits.division);
    }

    setImmediate(createNextOptionsByOrgUnit, prodLines, done);
  }

  function createOptionsByOrgUnit(orgUnitType, orgUnitId)
  {
    if (options.byOrgUnit[orgUnitId])
    {
      return;
    }

    const orgUnit = orgUnitsModule.getByTypeAndId(orgUnitType, orgUnitId);
    const division = orgUnit ? orgUnitsModule.getDivisionFor(orgUnit) : null;
    let subdivisions = orgUnit ? orgUnitsModule.getSubdivisionsFor(orgUnit) : null;

    if (subdivisionType === 'prod' || subdivisionType === 'press')
    {
      subdivisions = filterSubdivisionByType(
        orgUnitsModule,
        subdivisions,
        subdivisionType === 'press' ? 'press' : 'assembly'
      );
    }

    options.byOrgUnit[orgUnitId] = {
      orgUnitType: orgUnitType,
      orgUnitId: orgUnitId,
      division: helpers.idToStr(division),
      subdivisions: helpers.idToStr(subdivisions),
      prodFlows: helpers.idToStr(orgUnitsModule.getProdFlowsFor(orgUnit)),
      orgUnits: helpers.getOrgUnitsForFte(orgUnitsModule, orgUnitType, orgUnit)
    };
  }

  function serializeRow(results, fteByOrgUnit, pso)
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
        effDen: 0,
        prodDen: getProdDen(fteByOrgUnit, pso.division, groupKey)
      };
    }

    if (!group[pso.subdivision])
    {
      group[pso.subdivision] = {
        effNum: 0,
        effDen: 0,
        prodDen: getProdDen(fteByOrgUnit, pso.subdivision, groupKey)
      };
    }

    if (!group[pso.prodLine])
    {
      group[pso.prodLine] = {
        effNum: 0,
        effDen: 0,
        prodDen: getProdDen(fteByOrgUnit, pso.prodLine, groupKey)
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

  function getProdDen(fteByOrgUnit, orgUnitId, groupKey)
  {
    const fte = fteByOrgUnit[orgUnitId];

    if (!fte || !fte.grouped[groupKey])
    {
      return 0;
    }

    return fte.grouped[groupKey].prodDenMaster;
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

    const subHeader = {
      division: '',
      subdivision: '',
      mrpControllers: '',
      prodFlow: '',
      workCenter: '',
      prodLine: ''
    };

    groups.forEach(group =>
    {
      subHeader[group.label + '$EFF'] = 'Eff';
      subHeader[group.label + '$PROD'] = 'Prod';
    });

    subHeader.total$EFF = 'Eff';
    subHeader.total$PROD = 'Prod';

    emitter.emit('data', subHeader);

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
    if (options.orgUnitType && options.orgUnitType !== 'division')
    {
      if (options.orgUnitType === 'subdivision' && orgUnitType === 'division')
      {
        return;
      }

      if (options.orgUnitType !== 'subdivision' && orgUnitType !== 'prodLine')
      {
        return;
      }
    }

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
    let totalProdDen = 0;

    groups.forEach(group =>
    {
      const data = (results.groups[group.key] || {})[orgUnits[orgUnitType]._id] || {
        effNum: 0,
        effDen: 0,
        prodDen: 0
      };

      totalEffNum += data.effNum;
      totalEffDen += data.effDen;
      totalProdDen += data.prodDen;

      row[group.label + '$EFF'] = data.effDen > 0
        ? Math.round(data.effNum / data.effDen * 100) / 100
        : 0;
      row[group.label + '$PROD'] = data.prodDen > 0
        ? Math.round(data.effNum / reportsModule.prodNumConstant / data.prodDen * 100) / 100
        : 0;
    });

    row.total$EFF = totalEffDen > 0
      ? Math.round(totalEffNum / totalEffDen * 100) / 100
      : 0;
    row.total$PROD = totalProdDen > 0
      ? Math.round(totalEffNum / reportsModule.prodNumConstant / totalProdDen * 100) / 100
      : 0;

    emitter.emit('data', row);
  }

  function filterSubdivisionByType(orgUnitsModule, subdivisions, subdivisionType)
  {
    if (subdivisions === null)
    {
      subdivisions = orgUnitsModule.getAllByType('subdivision');
    }

    subdivisions = subdivisions.filter(function(subdivision)
    {
      return subdivision.type === subdivisionType;
    });

    return subdivisions;
  }
};
