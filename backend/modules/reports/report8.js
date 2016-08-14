// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var PLAN = 0;
  var REAL = 1;
  var DATE_FORMAT = 'YYMMDD';

  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var FteMasterEntry = mongoose.model('FteMasterEntry');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');
  var HourlyPlan = mongoose.model('HourlyPlan');

  var settings = _.defaults(options.settings, {
    hoursCoeff: 8,
    totalVolumeProducedProdFlows: [],
    prodQualityInspectionPlan: 0,
    prodQualityInspectionSubdivision: '',
    materialQualityInspectionPlan: 0,
    materialQualityInspectionSubdivision: '',
    maintenancePlan: 0,
    maintenanceSubdivision: '',
    prodOperatorCoeff: 0.95,
    realProdSetterDowntimeReasons: [],
    leadersPlanDen: 12,
    prodMaterialHandlingPlanCoeff: 0.1,
    kittersPlanCoeff1: 1.45,
    kittersPlanCoeff2: 0.3,
    realKittersProdTasks: [],
    prodTransportPlanCoeff1: 1.45,
    prodTransportPlanCoeff2: 0.7,
    realProdTransportProdTasks: [],
    cycleCountingPlanCoeff1: 1.45,
    cycleCountingPlanCoeff2: 0.7,
    realCycleCountingProdTasks: [],
    otherWarehousingPlanCoeff1: 1.45,
    otherWarehousingPlanCoeff2: 0.7,
    realOtherWarehousingProdTasks: [],
    realRoutingTimeForLineDowntimeReasons: [],
    realRoutingTimeForLabourDowntimeReasons: [],
    heijunkaTimeForLineCoeff: 0.95,
    realBreaksDowntimeReasons: [],
    realFap0DowntimeReasons: [],
    realStartupDowntimeReasons: [],
    realMeetingsDowntimeReasons: [],
    realSixSDowntimeReasons: [],
    realTpmDowntimeReasons: [],
    realTrainingsDowntimeReasons: [],
    realCoTimeDowntimeReasons: [],
    totalDowntimeReasons: [],
    realShutdownThreshold: 0,
    planProdFlows: [],
    efficiencyPlanFormula: '0',
    realEfficiencyFormula: '0'
  });

  var results = {
    options: options.debug ? options : {
      fromTime: options.fromTime,
      toTime: options.toTime
    },
    debug: options.debug ? {} : undefined,
    summary: createDataGroup(),
    groups: {}
  };

  var fromDate = moment(options.fromTime).hours(6).toDate();
  var toDate = moment(options.toTime).hours(6).toDate();
  var shiftToActiveOrgUnits = {};
  var prodLineToWorkingDays = {};
  var orderToDowntimeForLine = {};
  var orderToDowntimeForLabour = {};
  var realTotalVolumeProducedPerShift = {};
  var usedDays = {0: _.includes(options.days, '7')};
  var usedShifts = {};
  var usedDivisions = {};
  var usedSubdivisionTypes = {};
  var usedProdLines = {};
  var usedProdFlows = _.isEmpty(options.prodFlows) ? null : options.prodFlows;
  var usedSubdivisions = _.isEmpty(options.subdivisions) ? null : options.subdivisions;
  var allProdLines = [];

  _.forEach(options.days, function(k) { usedDays[k] = true; });
  _.forEach(options.shifts, function(k) { usedShifts[k] = true; });
  _.forEach(options.divisions, function(k) { usedDivisions[k] = true; });
  _.forEach(options.subdivisionTypes, function(k) { usedSubdivisionTypes[k] = true; });
  _.forEach(options.prodLines, function(k) { usedProdLines[k] = true; });
  _.forEach(options.subdivisions, function(sdProdLines) { allProdLines = allProdLines.concat(sdProdLines); });

  var USED_SHIFT_COUNT = _.size(usedShifts);
  var IN_MINUTES = options.unit === 'm';
  var UNIT_DIV = IN_MINUTES ? 1 : 60;
  var UNIT_MUL = IN_MINUTES ? 60 : 1;
  var UNPLANNED = options.unplanned / UNIT_DIV;
  var BREAKS = options.breaks / UNIT_DIV;
  var FAP0 = options.fap0 / UNIT_DIV;
  var STARTUP = options.startup / UNIT_DIV;
  var SHUTDOWN = options.shutdown / UNIT_DIV;
  var MEETINGS = options.meetings / UNIT_DIV;
  var SIX_S = options.sixS / UNIT_DIV;
  var TPM = options.tpm / UNIT_DIV;
  var TRAININGS = options.trainings / UNIT_DIV;
  var CO_TIME = options.coTime / UNIT_DIV;
  var DOWNTIME = options.downtime / 100;
  var CALC_EFFICIENCY_PLAN = compileEfficiencyFormula(settings.efficiencyPlanFormula, PLAN);
  var CALC_EFFICIENCY_REAL = compileEfficiencyFormula(settings.realEfficiencyFormula, REAL);
  var REAL_SHUTDOWN_THRESHOLD = settings.realShutdownThreshold * 60 * 1000;
  var DOWNTIME_REASONS = {
    total: {
      all: _.isEmpty(settings.totalDowntimeReasons)
    },
    realProdSetter: {},
    realRoutingTimeForLine: {},
    realRoutingTimeForLabour: {},
    realBreaks: {},
    realFap0: {},
    realStartup: {},
    realMeetings: {},
    realSixS: {},
    realTpm: {},
    realTrainings: {},
    realCoTime: {}
  };
  var PROD_TASKS = {
    realKitters: {},
    realProdTransport: {},
    realCycleCounting: {},
    realOtherWarehousing: {}
  };
  var TOTAL_VOLUME_PRODUCED_PROD_FLOWS = {};
  var PLAN_PROD_FLOWS = {};

  _.forEach(DOWNTIME_REASONS, function(downtimeReasons, prop)
  {
    _.forEach(settings[prop + 'DowntimeReasons'], function(downtimeReasonId)
    {
      downtimeReasons[downtimeReasonId] = true;
    });
  });
  _.forEach(PROD_TASKS, function(prodTasks, prop)
  {
    _.forEach(settings[prop + 'ProdTasks'], function(prodTaskId)
    {
      prodTasks[prodTaskId] = true;
    });
  });
  _.forEach(settings.totalVolumeProducedProdFlows, function(prodFlowId)
  {
    TOTAL_VOLUME_PRODUCED_PROD_FLOWS[prodFlowId] = true;
  });
  _.forEach(settings.planProdFlows, function(prodFlowId)
  {
    PLAN_PROD_FLOWS[prodFlowId] = true;
  });

  step(
    function getActiveOrgUnitsStep()
    {
      getActiveOrgUnits(this.next());
    },
    function handleFteStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      handleHourlyPlans(this.group());
      handleFteMasterEntries(this.group());
      handleFteLeaderEntries(this.group());
    },
    function handleDowntimesStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      handleProdDowntimes(this.next());
    },
    function handleShiftsAndOrdersStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      handleProdShifts(this.group());
      handleProdShiftOrders(this.group());
    },
    function prepareResultsStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      _.forEach(prodLineToWorkingDays, function(workingDays, prodLineId)
      {
        prodLineToWorkingDays[prodLineId] = Object.keys(workingDays).length;
      });

      var sortedGroups = [];
      var summary = results.summary;

      var currentGroupKey = moment(options.fromTime).startOf(options.interval);
      var now = Date.now();
      var lastGroupKey = options.toTime > now
        ? moment(now).startOf(options.interval).add(1, options.interval)
        : moment(options.toTime).startOf(options.interval);

      if (lastGroupKey.valueOf() === currentGroupKey.valueOf())
      {
        lastGroupKey.add(1, options.interval);
      }

      lastGroupKey = lastGroupKey.valueOf();

      while (currentGroupKey.valueOf() < lastGroupKey)
      {
        var groupKey = currentGroupKey.valueOf();
        var group = results.groups[groupKey] || createDataGroup(groupKey);

        sortedGroups.push(calcMetrics(group, null));

        currentGroupKey.add(1, options.interval);
      }

      calcMetrics(summary, sortedGroups);

      results.groups = sortedGroups;

      if (options.debug)
      {
        results.shiftToActiveOrgUnits = shiftToActiveOrgUnits;
      }

      setImmediate(this.next());
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, results);
      }
    }
  );

  function countAllShiftsInGroup(groupKey)
  {
    var date = moment(groupKey);
    var toTime = moment(groupKey).add(1, options.interval);
    var shiftCount = 0;

    while (date.valueOf() < toTime)
    {
      if (usedDays[date.day()])
      {
        shiftCount += USED_SHIFT_COUNT * countSelectedActiveProdLines(date.valueOf(), allProdLines);
      }

      date.add(1, 'days');
    }

    return shiftCount;
  }

  function calcMetrics(group, groups)
  {
    calcAllDayCount(group, groups);
    calcAllShiftCount(group, groups);
    calcRealTotalVolumeProduced(group, groups);

    group.workingDayCount = groups === null
      ? _.size(group.workingDayCount)
      : _.reduce(groups, function(total, group) { return total + group.workingDayCount; }, 0);

    var fteDays = usedDays.noWork ? group.allDayCount : group.workingDayCount;

    group.workingShiftCount = _.size(group.workingShiftCount);
    group.timeAvailablePerShift[PLAN] = calcTimeAvailablePerShiftPlan(group);
    group.timeAvailablePerShift[REAL] = calcRealTimeAvailablePerShift(group);
    group.averageRoutingTime = util.round(group.averageRoutingTime / group.orderCount);
    group.prodOperators[PLAN] = countProdOperatorsPlan(group.prodOperators[PLAN]);
    group.prodOperators[REAL] = util.round(group.prodOperators[REAL] / fteDays);
    group.prodBasedPlanners[PLAN] = countProdBasedPlanners(group, PLAN);
    group.prodBasedPlanners[REAL] = group.prodBasedPlanners[PLAN];
    group.prodSetters[PLAN] = countProdSettersPlan(group.prodSetters[PLAN]);
    group.prodSetters[REAL] = util.round(group.prodSetters[REAL] / settings.hoursCoeff / fteDays);
    group.masters[PLAN] = countMastersPlan(group.masters[PLAN]);
    group.masters[REAL] = util.round(group.masters[REAL] / fteDays);
    group.leaders[PLAN] = util.round(group.prodOperators[PLAN] / settings.leadersPlanDen);
    group.leaders[REAL] = util.round(group.leaders[REAL] / fteDays);
    group.prodMaterialHandling[PLAN] = util.round(group.prodOperators[PLAN] * settings.prodMaterialHandlingPlanCoeff);
    group.prodMaterialHandling[REAL] = util.round(group.prodMaterialHandling[REAL] / fteDays);
    group.kitters[PLAN] = calcKittersPlan(group);
    group.kitters[REAL] = util.round(group.kitters[REAL] / fteDays);
    group.prodTransport[PLAN] = calcProdTransportPlan(group);
    group.prodTransport[REAL] = util.round(group.prodTransport[REAL] / fteDays);
    group.cycleCounting[PLAN] = calcCycleCountingPlan(group);
    group.cycleCounting[REAL] = util.round(group.cycleCounting[REAL] / fteDays);
    group.otherWarehousing[PLAN] = calcOtherWarehousingPlan(group);
    group.otherWarehousing[REAL] = util.round(group.otherWarehousing[REAL] / fteDays);
    group.prodQualityInspection[REAL] = util.round(group.prodQualityInspection[REAL] / fteDays);
    group.materialQualityInspection[REAL] = util.round(group.materialQualityInspection[REAL] / fteDays);
    group.maintenance[REAL] = util.round(group.maintenance[REAL] / fteDays);
    group.routingTimeForLine[PLAN] = util.round(group.routingTimeForLine[PLAN] / group.orderCountForLine);
    group.routingTimeForLine[REAL] = util.round(group.routingTimeForLine[REAL] / group.orderCountForLine);
    group.routingTimeForLabour[PLAN] = util.round(group.routingTimeForLabour[PLAN] / group.orderCountForLine);
    group.routingTimeForLabour[REAL] = util.round(group.routingTimeForLabour[REAL] / group.orderCountForLine);
    group.heijunkaTimeForLine = util.round(group.routingTimeForLine[PLAN] / settings.heijunkaTimeForLineCoeff);
    group.breaks[PLAN] = util.round(group.allShiftCount * BREAKS);
    group.fap0[PLAN] = util.round(group.allShiftCount * FAP0);
    group.startup[PLAN] = util.round(group.allShiftCount * STARTUP);
    group.shutdown[PLAN] = util.round(group.allShiftCount * SHUTDOWN);
    group.shutdown[REAL] = util.round(group.shutdown[REAL] / 1000 / (IN_MINUTES ? 60 : 3600));
    group.meetings[PLAN] = util.round(group.allShiftCount * MEETINGS);
    group.sixS[PLAN] = util.round(group.allShiftCount * SIX_S);
    group.tpm[PLAN] = util.round(group.allShiftCount * TPM);
    group.trainings[PLAN] = util.round(group.allShiftCount * TRAININGS);
    group.coTime[PLAN] = util.round(group.orderCountForLine * CO_TIME);
    group.downtime[PLAN] = util.round(group.timeAvailablePerShift[PLAN] * DOWNTIME);
    group.efficiency[PLAN] = CALC_EFFICIENCY_PLAN(group) || 0;
    group.efficiency[REAL] = CALC_EFFICIENCY_REAL(group) || 0;

    return group;
  }

  function createDataGroup(key)
  {
    return {
      key: key,
      totalVolumeProduced: [0, 0],
      averageRoutingTime: 0,
      orderCount: 0,
      allDayCount: {},
      workingDayCount: {},
      allShiftCount: {},
      workingShiftCount: {},
      prodBasedPlanners: [0, 0],
      prodQualityInspection: [settings.prodQualityInspectionPlan, 0],
      prodOperators: [{}, 0],
      prodSetters: [{}, 0],
      masters: [{shiftsPerDivision: {}, days: {}}, 0],
      leaders: [0, 0],
      prodMaterialHandling: [0, 0],
      kitters: [0, 0],
      prodTransport: [0, 0],
      cycleCounting: [0, 0],
      otherWarehousing: [0, 0],
      materialQualityInspection: [settings.materialQualityInspectionPlan, 0],
      maintenance: [settings.maintenancePlan, 0],
      timeAvailablePerShift: [0, 0],
      orderCountForLine: 0,
      routingTimeForLine: [0, 0],
      routingTimeForLabour: [0, 0],
      heijunkaTimeForLine: 0,
      breaks: [0, 0],
      fap0: [0, 0],
      startup: [0, 0],
      shutdown: [0, 0],
      meetings: [0, 0],
      sixS: [0, 0],
      tpm: [0, 0],
      trainings: [0, 0],
      coTime: [0, 0],
      downtime: [0, 0],
      plan: [0, 0],
      efficiency: [0, 0],
      downtimeByAor: {}
    };
  }

  function createDataGroupKey(date)
  {
    return util.createGroupKey(options.interval, date, true);
  }

  function getDataGroup(date)
  {
    var key = createDataGroupKey(date);

    if (!results.groups[key])
    {
      results.groups[key] = createDataGroup(key);
    }

    return results.groups[key];
  }

  function handleStream(Model, conditions, fields, handleDocument, done)
  {
    var complete = _.once(done);
    var stream = Model.find(conditions, fields).lean().cursor();

    stream.on('error', complete);
    stream.on('end', complete);
    stream.on('data', handleDocument);
  }

  function getActiveOrgUnits(done)
  {
    var pipeline = [
      {$match: {
        startedAt: {$gte: fromDate, $lt: toDate}
      }},
      {$group: {
        _id: {
          date: '$date',
          division: '$division',
          subdivision: '$subdivision',
          prodFlow: '$prodFlow'
        },
        prodLines: {$addToSet: '$prodLine'}
      }}
    ];

    ProdShiftOrder.aggregate(pipeline, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      var divisions = {};

      _.forEach(results, function(result)
      {
        var shiftKey = result._id.date.getTime().toString();
        var divisionId = result._id.division;
        var subdivisionId = result._id.subdivision;
        var prodFlowId = result._id.prodFlow.toString();

        divisions[divisionId] = true;

        if (!shiftToActiveOrgUnits[shiftKey])
        {
          shiftToActiveOrgUnits[shiftKey] = {
            allProdLineCount: 0,
            allProdLines: {},
            prodLineCountPerDivision: {}
          };
        }

        var shiftActiveOrgUnits = shiftToActiveOrgUnits[shiftKey];

        if (!shiftActiveOrgUnits[divisionId])
        {
          shiftActiveOrgUnits[divisionId] = result.prodLines;
        }
        else
        {
          shiftActiveOrgUnits[divisionId] = shiftActiveOrgUnits[divisionId].concat(result.prodLines);
        }

        if (!shiftActiveOrgUnits[subdivisionId])
        {
          shiftActiveOrgUnits[subdivisionId] = result.prodLines;
        }
        else
        {
          shiftActiveOrgUnits[subdivisionId] = shiftActiveOrgUnits[subdivisionId].concat(result.prodLines);
        }

        shiftActiveOrgUnits[prodFlowId] = result.prodLines;

        _.forEach(result.prodLines, function(prodLineId)
        {
          shiftActiveOrgUnits.allProdLines[prodLineId] = true;
        });
      });

      _.forEach(shiftToActiveOrgUnits, function(shiftData)
      {
        shiftData.allProdLineCount = Object.keys(shiftData).length;

        _.forEach(divisions, function(nil, divisionId)
        {
          shiftData.prodLineCountPerDivision[divisionId] = shiftData[divisionId]
            ? Object.keys(shiftData[divisionId]).length
            : 0;
        });
      });

      return setImmediate(done);
    });
  }

  function countSelectedActiveProdLines(dateTime, allProdLines)
  {
    var count = 0;

    for (var i = 0; i < allProdLines.length; ++i)
    {
      var deactivatedAt = options.deactivatedProdLines[allProdLines[i]];

      if (!deactivatedAt || dateTime < deactivatedAt)
      {
        ++count;
      }
    }

    return count;
  }

  function countActiveProdLines(shiftKey, orgUnitId)
  {
    var activeProdFlows = shiftToActiveOrgUnits[shiftKey];

    return !activeProdFlows || !activeProdFlows[orgUnitId] ? 0 : activeProdFlows[orgUnitId].length;
  }

  function handleHourlyPlans(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      }
    };
    var fields = {
      division: 1,
      date: 1,
      'flows.id': 1,
      'flows.hours': 1
    };

    handleStream(HourlyPlan, conditions, fields, handleHourlyPlan, done);
  }

  function handleHourlyPlan(hourlyPlan)
  {
    if (filterDay(hourlyPlan.date))
    {
      return;
    }

    var summary = results.summary;
    var group = getDataGroup(hourlyPlan.date);
    var shiftMoment = moment(hourlyPlan.date).startOf('day');
    var dateTime = shiftMoment.valueOf();
    var inc = function(count, selectedActiveProdLines, allActiveProdLines, changeTvp, changePlan)
    {
      if (count === 0)
      {
        return;
      }

      if (changeTvp)
      {
        group.totalVolumeProduced[PLAN] += count;
        summary.totalVolumeProduced[PLAN] += count;
      }

      if (selectedActiveProdLines === 0 || !changePlan)
      {
        return;
      }

      if (selectedActiveProdLines !== -1 && allActiveProdLines !== 0 && selectedActiveProdLines < allActiveProdLines)
      {
        count = Math.ceil(count * (selectedActiveProdLines / allActiveProdLines));
      }

      group.plan[PLAN] += count;
      summary.plan[PLAN] += count;
    };

    for (var i = 0; i < hourlyPlan.flows.length; ++i)
    {
      var flow = hourlyPlan.flows[i];
      var flowId = flow.id.toString();
      var changeTvp = isTotalVolumeProducedProdFlow(flowId);
      var changePlan = isPlanProdFlow(flowId);

      if (!changeTvp && !changePlan)
      {
        continue;
      }

      var selectedActiveProdLines = usedProdFlows === null
        ? -1
        : options.prodFlows[flowId]
          ? countSelectedActiveProdLines(dateTime, options.prodFlows[flowId])
          : 0;
      var allActiveProdLines;
      var h;

      if (usedShifts['1'])
      {
        allActiveProdLines = countActiveProdLines(shiftMoment.hours(6).valueOf(), flowId);

        for (h = 0; h < 8; ++h)
        {
          inc(flow.hours[h], selectedActiveProdLines, allActiveProdLines, changeTvp, changePlan);
        }
      }

      if (usedShifts['2'])
      {
        allActiveProdLines = countActiveProdLines(shiftMoment.hours(14).valueOf(), flowId);

        for (h = 8; h < 14; ++h)
        {
          inc(flow.hours[h], selectedActiveProdLines, allActiveProdLines, changeTvp, changePlan);
        }
      }

      if (usedShifts['3'])
      {
        allActiveProdLines = countActiveProdLines(shiftMoment.hours(22).valueOf(), flowId);

        for (h = 14; h < 24; ++h)
        {
          inc(flow.hours[h], selectedActiveProdLines, allActiveProdLines, changeTvp, changePlan);
        }
      }
    }
  }

  function handleProdShifts(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      },
      shift: {$in: options.shifts}
    };

    if (options.prodLines.length)
    {
      conditions.prodLine = {$in: options.prodLines};
    }
    else
    {
      conditions.subdivision = {$in: Object.keys(options.subdivisions)};
    }

    var fields = {
      subdivision: 1,
      prodFlow: 1,
      prodLine: 1,
      date: 1,
      shutdown: 1,
      'quantitiesDone.actual': 1
    };

    handleStream(ProdShift, conditions, fields, handleProdShift, done);
  }

  function handleProdShift(prodShift)
  {
    if (filterDay(prodShift.date))
    {
      return;
    }

    var summary = results.summary;
    var group = getDataGroup(prodShift.date);

    if (prodShift.shutdown <= REAL_SHUTDOWN_THRESHOLD)
    {
      summary.shutdown[REAL] += prodShift.shutdown;
      group.shutdown[REAL] += prodShift.shutdown;
    }

    if (isPlanProdFlow(prodShift.prodFlow) && isInSelectedOrgUnit(prodShift))
    {
      var quantitiesDone = prodShift.quantitiesDone;

      for (var i = 0; i < 8; ++i)
      {
        summary.plan[REAL] += quantitiesDone[i].actual;
        group.plan[REAL] += quantitiesDone[i].actual;
      }
    }
  }

  function handleProdShiftOrders(done)
  {
    var conditions = {
      startedAt: {
        $gte: fromDate,
        $lt: toDate
      },
      shift: {$in: options.shifts}
    };

    var fields = {
      division: 1,
      subdivision: 1,
      prodFlow: 1,
      workCenter: 1,
      prodLine: 1,
      date: 1,
      finishedAt: 1,
      mechOrder: 1,
      orderId: 1,
      operationNo: 1,
      machineTime: 1,
      laborTime: 1,
      totalDuration: 1,
      quantityDone: 1,
      workerCount: 1
    };

    handleStream(ProdShiftOrder, conditions, fields, handleProdShiftOrder, done);
  }

  function handleProdShiftOrder(prodShiftOrder)
  {
    if (filterDay(prodShiftOrder.date)
      || !prodShiftOrder.finishedAt
      || !prodShiftOrder.quantityDone
      || prodShiftOrder.date >= toDate)
    {
      return;
    }

    var summary = results.summary;
    var group = getDataGroup(prodShiftOrder.date);
    var dateKey = moment(prodShiftOrder.date).format(DATE_FORMAT);
    var shiftKey = prodShiftOrder.date.getTime().toString();
    var divisionId = prodShiftOrder.division;
    var prodLineId = prodShiftOrder.prodLine;
    var inSelectedOrgUnit = isInSelectedOrgUnit(prodShiftOrder);
    var planProdFlow = isPlanProdFlow(prodShiftOrder.prodFlow);

    if (isTotalVolumeProducedOrder(prodShiftOrder))
    {
      groupOrderOperationQuantity(realTotalVolumeProducedPerShift, shiftKey, prodShiftOrder);
    }

    var workerCount = prodShiftOrder.workerCount || 1;
    var machineTime = prodShiftOrder.machineTime * UNIT_MUL / 100;
    var labourTime = prodShiftOrder.laborTime * UNIT_MUL / 100;

    summary.averageRoutingTime += machineTime;
    group.averageRoutingTime += machineTime;
    summary.orderCount += 1;
    group.orderCount += 1;

    if (inSelectedOrgUnit)
    {
      var routingTimeForLinePlan = prodShiftOrder.laborTime / workerCount * UNIT_MUL / 100;

      summary.routingTimeForLine[PLAN] += routingTimeForLinePlan;
      group.routingTimeForLine[PLAN] += routingTimeForLinePlan;
      summary.routingTimeForLabour[PLAN] += labourTime;
      group.routingTimeForLabour[PLAN] += labourTime;
      summary.orderCountForLine += 1;
      group.orderCountForLine += 1;

      var totalDuration = prodShiftOrder.totalDuration * UNIT_MUL;
      var durationForLine = totalDuration - (orderToDowntimeForLine[prodShiftOrder._id] || 0);
      var durationForLabour = totalDuration - (orderToDowntimeForLabour[prodShiftOrder._id] || 0);
      var realRoutingTimeForLine = durationForLine / prodShiftOrder.quantityDone;
      var realRoutingTimeForLabour = durationForLabour / prodShiftOrder.quantityDone * workerCount;

      summary.routingTimeForLine[REAL] += realRoutingTimeForLine;
      group.routingTimeForLine[REAL] += realRoutingTimeForLine;
      summary.routingTimeForLabour[REAL] += realRoutingTimeForLabour;
      group.routingTimeForLabour[REAL] += realRoutingTimeForLabour;

      var shiftCountKey = shiftKey + prodLineId;

      summary.allShiftCount[shiftCountKey] = true;
      group.allShiftCount[shiftCountKey] = true;
      summary.workingShiftCount[shiftCountKey] = true;
      group.workingShiftCount[shiftCountKey] = true;
    }

    var prodOperatorPlanNum = prodShiftOrder.laborTime / 100 * prodShiftOrder.quantityDone;

    if (!summary.prodOperators[PLAN][prodLineId])
    {
      summary.prodOperators[PLAN][prodLineId] = {num: 0, days: {}};
      summary.prodSetters[PLAN][prodLineId] = {num: 0, days: {}};
    }

    if (!group.prodOperators[PLAN][prodLineId])
    {
      group.prodOperators[PLAN][prodLineId] = {num: 0, days: {}};
      group.prodSetters[PLAN][prodLineId] = {num: 0, days: {}};
    }

    summary.prodOperators[PLAN][prodLineId].num += prodOperatorPlanNum;
    group.prodOperators[PLAN][prodLineId].num += prodOperatorPlanNum;
    summary.prodOperators[PLAN][prodLineId].days[dateKey] = true;
    group.prodOperators[PLAN][prodLineId].days[dateKey] = true;

    if (planProdFlow)
    {
      summary.prodSetters[PLAN][prodLineId].num += 1;
      group.prodSetters[PLAN][prodLineId].num += 1;
      summary.prodSetters[PLAN][prodLineId].days[dateKey] = true;
      group.prodSetters[PLAN][prodLineId].days[dateKey] = true;
    }

    group.workingDayCount[dateKey] = true;

    if (!prodLineToWorkingDays[prodLineId])
    {
      prodLineToWorkingDays[prodLineId] = {};
    }

    prodLineToWorkingDays[prodLineId][dateKey] = true;

    var shiftsPerDivision = summary.masters[PLAN].shiftsPerDivision;

    if (!shiftsPerDivision[divisionId])
    {
      shiftsPerDivision[divisionId] = {};
    }

    shiftsPerDivision[divisionId][shiftKey] = true;
    summary.masters[PLAN].days[dateKey] = true;

    shiftsPerDivision = group.masters[PLAN].shiftsPerDivision;

    if (!shiftsPerDivision[divisionId])
    {
      shiftsPerDivision[divisionId] = {};
    }

    shiftsPerDivision[divisionId][shiftKey] = true;
    group.masters[PLAN].days[dateKey] = true;
  }

  function groupOrderOperationQuantity(group, shiftKey, prodShiftOrder)
  {
    var orders = group[shiftKey];

    if (!orders)
    {
      orders = group[shiftKey] = {};
    }

    var order = orders[prodShiftOrder.orderId];

    if (!order)
    {
      order = orders[prodShiftOrder.orderId] = {};
    }

    order[prodShiftOrder.operationNo] = prodShiftOrder.quantityDone + (order[prodShiftOrder.operationNo] || 0);
  }

  function handleProdDowntimes(done)
  {
    var conditions = {
      startedAt: {
        $gte: fromDate,
        $lt: toDate
      },
      shift: {$in: options.shifts}
    };

    var fields = {
      division: 1,
      subdivision: 1,
      prodFlow: 1,
      prodLine: 1,
      date: 1,
      aor: 1,
      reason: 1,
      startedAt: 1,
      finishedAt: 1,
      prodShiftOrder: 1
    };

    handleStream(ProdDowntime, conditions, fields, handleProdDowntime, done);
  }

  function handleProdDowntime(prodDowntime)
  {
    if (filterDay(prodDowntime.date) || !prodDowntime.finishedAt || prodDowntime.date >= toDate)
    {
      return;
    }

    var summary = results.summary;
    var group = getDataGroup(prodDowntime.date);
    var shiftKey = prodDowntime.date.getTime().toString();
    var prodLineId = prodDowntime.prodLine;
    var duration = (prodDowntime.finishedAt.getTime() - prodDowntime.startedAt.getTime()) / 3600000;

    if (DOWNTIME_REASONS.realProdSetter[prodDowntime.reason])
    {
      summary.prodSetters[REAL] += duration;
      group.prodSetters[REAL] += duration;
    }

    if (!isInSelectedOrgUnit(prodDowntime))
    {
      return;
    }

    var prodShiftOrderId = prodDowntime.prodShiftOrder;

    if (DOWNTIME_REASONS.realRoutingTimeForLine[prodDowntime.reason])
    {
      if (!orderToDowntimeForLine[prodShiftOrderId])
      {
        orderToDowntimeForLine[prodShiftOrderId] = 0;
      }

      orderToDowntimeForLine[prodShiftOrderId] += duration;
    }

    if (DOWNTIME_REASONS.realRoutingTimeForLabour[prodDowntime.reason])
    {
      if (!orderToDowntimeForLabour[prodShiftOrderId])
      {
        orderToDowntimeForLabour[prodShiftOrderId] = 0;
      }

      orderToDowntimeForLabour[prodShiftOrderId] += duration;
    }

    if (IN_MINUTES)
    {
      duration *= 60;
    }

    if (DOWNTIME_REASONS.realBreaks[prodDowntime.reason])
    {
      summary.breaks[REAL] += duration;
      group.breaks[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realFap0[prodDowntime.reason])
    {
      summary.fap0[REAL] += duration;
      group.fap0[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realStartup[prodDowntime.reason])
    {
      summary.startup[REAL] += duration;
      group.startup[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realMeetings[prodDowntime.reason])
    {
      summary.meetings[REAL] += duration;
      group.meetings[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realSixS[prodDowntime.reason])
    {
      summary.sixS[REAL] += duration;
      group.sixS[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realTpm[prodDowntime.reason])
    {
      summary.tpm[REAL] += duration;
      group.tpm[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realTrainings[prodDowntime.reason])
    {
      summary.trainings[REAL] += duration;
      group.trainings[REAL] += duration;
    }

    if (DOWNTIME_REASONS.realCoTime[prodDowntime.reason])
    {
      summary.coTime[REAL] += duration;
      group.coTime[REAL] += duration;
    }

    if (DOWNTIME_REASONS.total.all || DOWNTIME_REASONS.total[prodDowntime.reason])
    {
      if (!summary.downtimeByAor[prodDowntime.aor])
      {
        summary.downtimeByAor[prodDowntime.aor] = 0;
      }

      summary.downtimeByAor[prodDowntime.aor] += duration;

      if (!group.downtimeByAor[prodDowntime.aor])
      {
        group.downtimeByAor[prodDowntime.aor] = 0;
      }

      group.downtimeByAor[prodDowntime.aor] += duration;

      summary.downtime[REAL] += duration;
      group.downtime[REAL] += duration;
    }

    summary.allShiftCount[shiftKey + prodLineId] = true;
    group.allShiftCount[shiftKey + prodLineId] = true;
  }

  function handleFteMasterEntries(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      },
      shift: {$in: options.shifts}
    };
    var fields = {
      subdivision: 1,
      date: 1,
      tasks: 1
    };

    handleStream(FteMasterEntry, conditions, fields, handleFteMasterEntry, done);
  }

  function handleFteMasterEntry(fteEntry)
  {
    if (filterDay(fteEntry.date))
    {
      return;
    }

    var summary = results.summary;
    var group = getDataGroup(fteEntry.date);

    _.forEach(fteEntry.tasks, function(task)
    {
      if (task.noPlan)
      {
        return;
      }

      _.forEach(task.functions, function(taskFunction)
      {
        var fte = 0;

        _.forEach(taskFunction.companies, function(taskCompany)
        {
          fte += taskCompany.count;
        });

        var adjustedFte = fte;

        switch (taskFunction.id)
        {
          case 'master':
            summary.prodBasedPlanners[PLAN] += adjustedFte;
            group.prodBasedPlanners[PLAN] += adjustedFte;
            summary.masters[REAL] += adjustedFte;
            group.masters[REAL] += adjustedFte;
            break;

          case 'leader':
            summary.leaders[REAL] += adjustedFte;
            group.leaders[REAL] += adjustedFte;
            break;

          case 'mizusumashi':
          case 'adjuster':
            summary.prodMaterialHandling[REAL] += adjustedFte;
            group.prodMaterialHandling[REAL] += adjustedFte;
            break;

          case 'operator':
            summary.prodOperators[REAL] += adjustedFte;
            group.prodOperators[REAL] += adjustedFte;
            break;
        }
      });
    });
  }

  function handleFteLeaderEntries(done)
  {
    var conditions = {
      date: {
        $gte: fromDate,
        $lt: toDate
      },
      shift: {$in: options.shifts}
    };
    var fields = {
      subdivision: 1,
      date: 1,
      tasks: 1
    };

    handleStream(FteLeaderEntry, conditions, fields, handleFteLeaderEntry, done);
  }

  function handleFteLeaderEntry(fteEntry)
  {
    if (filterDay(fteEntry.date))
    {
      return;
    }

    var subdivisionId = fteEntry.subdivision.toString();
    var summary = results.summary;
    var group = getDataGroup(fteEntry.date);

    _.forEach(fteEntry.tasks, function(task)
    {
      var taskId = task.id.toString();
      var fte = 0;

      _.forEach(task.companies, countFte);

      _.forEach(task.functions, function(taskFunction)
      {
        _.forEach(taskFunction.companies, countFte);
      });

      if (subdivisionId === settings.prodQualityInspectionSubdivision)
      {
        summary.prodQualityInspection[REAL] += fte;
        group.prodQualityInspection[REAL] += fte;
      }

      if (subdivisionId === settings.materialQualityInspectionSubdivision)
      {
        summary.materialQualityInspection[REAL] += fte;
        group.materialQualityInspection[REAL] += fte;
      }

      if (subdivisionId === settings.maintenanceSubdivision)
      {
        summary.maintenance[REAL] += fte;
        group.maintenance[REAL] += fte;
      }

      if (PROD_TASKS.realKitters[taskId])
      {
        summary.kitters[REAL] += fte;
        group.kitters[REAL] += fte;
      }

      if (PROD_TASKS.realProdTransport[taskId])
      {
        summary.prodTransport[REAL] += fte;
        group.prodTransport[REAL] += fte;
      }

      if (PROD_TASKS.realCycleCounting[taskId])
      {
        summary.cycleCounting[REAL] += fte;
        group.cycleCounting[REAL] += fte;
      }

      if (PROD_TASKS.realOtherWarehousing[taskId])
      {
        summary.otherWarehousing[REAL] += fte;
        group.otherWarehousing[REAL] += fte;
      }

      function countFte(taskCompany)
      {
        if (typeof taskCompany.count === 'number')
        {
          fte += taskCompany.count;
        }
        else
        {
          _.forEach(taskCompany.count, function(count)
          {
            fte += count.value;
          });
        }
      }
    });
  }

  function isTotalVolumeProducedOrder(prodShiftOrder)
  {
    return !prodShiftOrder.mechOrder
      && isTotalVolumeProducedProdFlow(prodShiftOrder.prodFlow)
      && !/^SPARE/.test(prodShiftOrder.workCenter);
  }

  function isTotalVolumeProducedProdFlow(prodFlowId)
  {
    return settings.totalVolumeProducedProdFlows.length === 0 || TOTAL_VOLUME_PRODUCED_PROD_FLOWS[prodFlowId] === true;
  }

  function isPlanProdFlow(prodFlowId)
  {
    return settings.planProdFlows.length === 0 || PLAN_PROD_FLOWS[prodFlowId] === true;
  }

  function isInSelectedOrgUnit(obj)
  {
    if (obj.prodLine !== undefined && options.prodLines.length > 0)
    {
      return !!usedProdLines[obj.prodLine];
    }

    return (obj.prodFlow !== undefined && usedProdFlows && !!usedProdFlows[obj.prodFlow])
      || (obj.subdivision !== undefined && usedSubdivisions && !!usedSubdivisions[obj.subdivision]);
  }

  function filterDay(date)
  {
    return !usedDays[date.getDay()];
  }

  function countProdOperatorsPlan(data)
  {
    var result = 0;

    _.forEach(data, function(plan)
    {
      result += plan.num / settings.hoursCoeff / Object.keys(plan.days).length / settings.prodOperatorCoeff;
    });

    return util.round(result);
  }

  function countProdBasedPlanners(group, type)
  {
    var hoursCoeff = settings.hoursCoeff;

    return util.round(group.prodBasedPlanners[type] / hoursCoeff);
  }

  function countProdSettersPlan(data)
  {
    var result = 0;

    _.forEach(data, function(plan)
    {
      result += plan.num * (options.coTime / 60) / settings.hoursCoeff / Object.keys(plan.days).length;
    });

    return util.round(result);
  }

  function countMastersPlan(data)
  {
    var num = 0;
    var den = Object.keys(data.days).length;

    _.forEach(data.shiftsPerDivision, function(shifts)
    {
      num += Object.keys(shifts).length;
    });

    return util.round(num / den);
  }

  function calcKittersPlan(group)
  {
    var prodOperators = group.prodOperators[PLAN];
    var prodMaterialHandling = group.prodMaterialHandling[PLAN];
    var result = ((prodOperators - prodMaterialHandling) * settings.kittersPlanCoeff1 - prodOperators)
      * settings.kittersPlanCoeff2;

    return util.round(result);
  }

  function calcProdTransportPlan(group)
  {
    var prodOperators = group.prodOperators[PLAN];
    var prodMaterialHandling = group.prodMaterialHandling[PLAN];
    var result = ((prodOperators - prodMaterialHandling) * settings.prodTransportPlanCoeff1 - prodOperators)
      * settings.prodTransportPlanCoeff2;

    return util.round(result);
  }

  function calcCycleCountingPlan(group)
  {
    var prodOperators = group.prodOperators[PLAN];
    var prodMaterialHandling = group.prodMaterialHandling[PLAN];
    var result = ((prodOperators - prodMaterialHandling) * settings.cycleCountingPlanCoeff1 - prodOperators)
      * settings.cycleCountingPlanCoeff2;

    return util.round(result);
  }

  function calcOtherWarehousingPlan(group)
  {
    var prodOperators = group.prodOperators[PLAN];
    var prodMaterialHandling = group.prodMaterialHandling[PLAN];
    var result = ((prodOperators - prodMaterialHandling) * settings.otherWarehousingPlanCoeff1 - prodOperators)
      * settings.otherWarehousingPlanCoeff2;

    return util.round(result);
  }

  function calcTimeAvailablePerShiftPlan(group)
  {
    var shiftCount = usedDays.noWork ? group.allShiftCount : group.workingShiftCount;

    return shiftCount * 8 * UNIT_MUL;
  }

  function calcRealTimeAvailablePerShift(group)
  {
    return util.round(group.timeAvailablePerShift[PLAN] - UNPLANNED);
  }

  function calcAllDayCount(group, groups)
  {
    if (groups !== null)
    {
      group.allDayCount = _.reduce(groups, function(total, group) { return total + group.allDayCount; }, 0);

      return;
    }

    var date = moment(group.key);
    var toTime = moment(group.key).add(1, options.interval);

    group.allDayCount = 0;

    while (date.valueOf() < toTime)
    {
      if (usedDays[date.day()])
      {
        group.allDayCount += 1;
      }

      date.add(1, 'days');
    }
  }

  function calcAllShiftCount(group, groups)
  {
    if (usedDays.noWork)
    {
      if (groups === null)
      {
        group.allShiftCount = countAllShiftsInGroup(group.key);

        return;
      }

      group.allShiftCount = _.reduce(groups, function(total, group) { return total + group.allShiftCount; }, 0);

      return;
    }

    group.allShiftCount = _.size(group.allShiftCount);
  }

  function calcRealTotalVolumeProduced(summary, groups)
  {
    if (groups === null)
    {
      return;
    }

    var groupMap = {};

    _.forEach(groups, function(group)
    {
      groupMap[group.key] = group;
    });

    _.forEach(realTotalVolumeProducedPerShift, function(shiftTvp, shiftKey)
    {
      var groupKey = createDataGroupKey(+shiftKey);
      var group = groupMap[groupKey];
      var tvp = 0;

      _.forEach(shiftTvp, function(orderTvp)
      {
        var max = 0;

        _.forEach(orderTvp, function(operationTvp)
        {
          if (operationTvp > max)
          {
            max = operationTvp;
          }
        });

        tvp += max;
      });

      group.totalVolumeProduced[REAL] += tvp;
      summary.totalVolumeProduced[REAL] += tvp;
    });

    realTotalVolumeProducedPerShift = null;
  }

  function compileEfficiencyFormula(formula, type)
  {
    /*jshint -W061*/

    var suffix = '[' + type + ']';
    var patterns = {
      TIME_AVAIL_PER_SHIFT: 'group.timeAvailablePerShift' + suffix,
      ROUTING_TIME_FOR_LINE: 'group.routingTimeForLine' + suffix,
      ROUTING_TIME_FOR_LABOUR: 'group.routingTimeForLabour' + suffix,
      HEIJUNKA_TIME_FOR_LINE: 'group.heijunkaTimeForLine',
      BREAKS: 'group.breaks' + suffix,
      FAP_0: 'group.fap0' + suffix,
      STARTUP: 'group.startup' + suffix,
      SHUTDOWN: 'group.shutdown' + suffix,
      MEETINGS: 'group.meetings' + suffix,
      '6S': 'group.sixS' + suffix,
      TPM: 'group.tpm' + suffix,
      TRAININGS: 'group.trainings' + suffix,
      CO_TIME: 'group.coTime' + suffix,
      DOWNTIME: 'group.downtime' + suffix
    };
    var code = formula;

    _.forEach(patterns, function(replacement, pattern)
    {
      code = code.replace(new RegExp(pattern, 'g'), replacement);
    });

    var calc = function() { return 0; };

    try
    {
      eval('calc = function(group) { return ' + code + '; }');
    }
    catch (err)
    {
      console.log(err.stack);
    }

    return calc;
  }
};
