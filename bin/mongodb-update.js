/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

// Recount
// /fix/clip/count-daily-mrp?from=2018-01-01
// /fix/fteMasterEntries/recount-totals?date=2018-01-01

const toRemove = [

];
const toUpdate = [{
  oldOrgUnits: {
    division: 'LPb',
    subdivision: new ObjectId('529f266ccd8eea9824000014'),
    mrpControllers: ['KGE'],
    prodFlow: new ObjectId('5c640bfc12bc4a1654ca14d0'),
    workCenter: 'OUTD15_1',
    prodLine: 'LM-42_GEARBOX'
  },
  newOrgUnits: {
    division: 'LPb',
    subdivision: new ObjectId('529f266ccd8eea9824000014'),
    mrpControllers: ['KGE'],
    prodFlow: new ObjectId('5c640bfc12bc4a1654ca14d0'),
    workCenter: 'OUTD15_1',
    prodLine: 'LM-42_GBOX'
  },
  fteMasterEntry: null,
  names: {
    prodFlow: 'Montaż Luma 2 - LM-42_GBOX',
    workCenter: 'Montaż Luma 2 - LM-42_GBOX',
    prodLine: 'Montaż Luma 2 - LM-42_GBOX'
  }
}];

const lineToDivision = {};
const fteCountPerLine = {};

db.prodlines.find().forEach(pl =>
{
  const wc = db.workcenters.findOne({_id: pl.workCenter});
  const pf = db.prodflows.findOne({_id: wc.prodFlow});
  const mrp = db.mrpcontrollers.findOne({_id: pf.mrpController[0]});
  const subdivision = db.subdivisions.findOne({_id: mrp.subdivision});

  lineToDivision[pl._id] = subdivision.division;
});

toUpdate.forEach(update =>
{
  lineToDivision[update.newOrgUnits.prodLine] = update.newOrgUnits.division;

  db.workcenters.updateOne({_id: update.oldOrgUnits.workCenter}, {$set: {
    prodFlow: update.newOrgUnits.prodFlow
  }});
});

function fromTo(property, update, shift, conditions)
{
  if (update.from)
  {
    conditions[property] = {
      $gte: new Date(update.from.getTime() + (shift ? 6 : 0) * 3600 * 1000)
    };
  }

  if (update.to)
  {
    if (!conditions[property])
    {
      conditions[property] = {};
    }

    conditions[property].$lt = new Date(update.to.getTime() + (shift ? 6 : 0) * 3600 * 1000);
  }

  return conditions;
}

toUpdate.forEach(update =>
{
  var oldOrgUnits = update.oldOrgUnits;
  var newOrgUnits = update.newOrgUnits;

  print(`${oldOrgUnits.prodLine} -> ${newOrgUnits.prodLine}...`);

  var oldProdLine = db.prodlines.findOne({_id: oldOrgUnits.prodLine});

  if (!oldProdLine)
  {
    return;
  }

  var newProdLine = db.prodlines.findOne({_id: newOrgUnits.prodLine});

  if (!newProdLine)
  {
    newProdLine = Object.assign({}, oldProdLine, {
      _id: newOrgUnits.prodLine,
      workCenter: newOrgUnits.workCenter
    });

    db.prodlines.insert(newProdLine);
  }

  var same = {};

  Object.keys(newOrgUnits).forEach(k =>
  {
    same[k] = String(oldOrgUnits[k]) === String(newOrgUnits[k]);
  });

  var $set1 = Object.assign({}, newOrgUnits);
  var $set2 = {};
  var $set3 = {};
  var orgUnitList = [];

  Object.keys($set1).forEach(k =>
  {
    $set2[k] = $set1[k];
    $set2[`data.${k}`] = $set1[k].valueOf();
    $set3[k] = $set1[k];
    $set3[`data.startedProdShift.${k}`] = $set1[k].valueOf();

    if (k === 'mrpControllers')
    {
      $set1[k].forEach(mrp => orgUnitList.push({
        type: 'mrpController',
        id: mrp
      }));
    }
    else
    {
      orgUnitList.push({
        type: k,
        id: $set1[k].valueOf()
      });
    }
  });

  print(`\t...ProdShift`);
  db.prodshifts.update(
    fromTo('date', update, false, {prodLine: oldOrgUnits.prodLine}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdShiftOrder`);
  db.prodshiftorders.update(
    fromTo('date', update, false, {prodLine: oldOrgUnits.prodLine}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdDowntime`);
  db.proddowntimes.update(
    fromTo('date', update, false, {prodLine: oldOrgUnits.prodLine}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdLogEntry`);
  print(`\t\t...1`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldOrgUnits.prodLine, 'data.startedProdShift.prodLine': oldOrgUnits.prodLine}),
    {$set: $set3},
    {multi: true}
  );
  print(`\t\t...2`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldOrgUnits.prodLine, 'data.prodLine': oldOrgUnits.prodLine}),
    {$set: $set2},
    {multi: true}
  );
  print(`\t\t...3`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldOrgUnits.prodLine}),
    {$set: $set1},
    {multi: true}
  );

  if (!same.division || !same.prodLine)
  {
    print(`\t...PressWorksheets`);
    db.pressworksheets.find(fromTo('date', update, false, {prodLines: oldOrgUnits.prodLine})).forEach(pw =>
    {
      var divisions = {};
      var prodLines = {};

      pw.orders.forEach(o =>
      {
        if (o.prodLine === oldOrgUnits.prodLine)
        {
          o.prodLine = newProdLine._id;
          o.division = newOrgUnits.division;
        }

        divisions[o.division] = 1;
        prodLines[o.prodLine] = 1;
      });

      pw.divisions = Object.keys(divisions);
      pw.prodLines = Object.keys(prodLines);

      db.pressworksheets.update({_id: pw._id}, pw);
    });
  }

  print(`\t...IsaEvent`);
  db.isaevents.update(
    fromTo('time', update, true, {orgUnits: {type: 'prodLine', id: oldOrgUnits.prodLine}}),
    {$set: {orgUnits: orgUnitList}},
    {multi: true}
  );

  print(`\t...IsaRequest`);
  db.isarequests.update(
    fromTo('requestedAt', update, true, {orgUnits: {type: 'prodLine', id: oldOrgUnits.prodLine}}),
    {$set: {orgUnits: orgUnitList}},
    {multi: true}
  );

  if (!same.division || !same.prodLine)
  {
    print(`\t...QiResult`);
    db.qiresults.update(
      fromTo('inspectedAt', update, true, {line: oldOrgUnits.prodLine}),
      {$set: {line: newProdLine._id, division: newOrgUnits.division}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...ProdSerialNumber`);
    db.prodserialnumbers.update(
      fromTo('scannedAt', update, true, {line: oldOrgUnits.prodLine}),
      {$set: {prodLine: newProdLine._id}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...WhOrderStatus`);
    db.whorderstatuses.find(fromTo('_id.date', update, true, {'_id.line': oldOrgUnits.prodLine})).forEach(whOrderStatus =>
    {
      db.whorderstatuses.remove({_id: whOrderStatus._id});

      whOrderStatus._id.line = newProdLine._id;

      db.whorderstatuses.insert(whOrderStatus);
    });
  }

  if (!same.prodLine)
  {
    print(`\t...BehaviorObsCard`);
    db.behaviorobscards.update(
      fromTo('date', update, true, {line: oldOrgUnits.prodLine}),
      {$set: {line: newProdLine._id}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...Plan`);
    db.plansettings.find(fromTo('_id', update, true, {'lines._id': oldOrgUnits.prodLine})).forEach(planSettings =>
    {
      planSettings.lines.find(l => l._id === oldOrgUnits.prodLine)._id = newProdLine._id;

      planSettings.mrps.forEach(planMrpSettings =>
      {
        planMrpSettings.lines = planMrpSettings.lines.map(line =>
        {
          line._id = line._id === oldOrgUnits.prodLine ? newProdLine._id : line._id;

          return line;
        });

        planMrpSettings.groups.forEach(group =>
        {
          group.lines = group.lines.map(line => line === oldOrgUnits.prodLine ? newProdLine._id : line);
        });
      });

      db.plansettings.update({_id: planSettings._id}, planSettings);

      var plan = db.plans.findOne({_id: planSettings._id});

      plan.lines.find(l => l._id === oldOrgUnits.prodLine)._id = newProdLine._id;

      plan.orders.forEach(planOrder =>
      {
        planOrder.lines = planOrder.lines.map(line => line === oldOrgUnits.prodLine ? newProdLine._id : line);
      });

      db.plans.update({_id: plan._id}, plan);
    });
  }

  if (update.fteMasterEntry)
  {
    print(`\t...FteMasterEntry`);

    db.ftemasterentries
      .find({subdivision: newOrgUnits.subdivision, 'tasks.id': oldOrgUnits.prodFlow})
      .forEach(entry => fixFteMasterEntry(entry, update));
  }

  if (!same.prodLine)
  {
    print(`\t...OrderBomMatcher`);
    db.orderbommatchers.find({'matchers.line': oldOrgUnits.prodLine}).forEach(obm =>
    {
      obm.matchers.line = obm.matchers.line.map(line =>
      {
        return line === oldOrgUnits.prodLine ? newOrgUnits.prodLine : line;
      });

      db.orderbommatchers.updateOne({_id: obm._id}, {$set: {matchers: obm.matchers}});
    });
  }

  if (!same.prodLine)
  {
    print(`\t...KanbanSupplyArea`);
    db.kanbansupplyareas.find({'lines': oldOrgUnits.prodLine}).forEach(sa =>
    {
      sa.lines = sa.lines.map(line =>
      {
        return line === oldOrgUnits.prodLine ? newOrgUnits.prodLine : line;
      });

      db.kanbansupplyareas.updateOne({_id: sa._id}, {$set: {lines: sa.lines}});
    });
  }

  if (!same.division || !same.prodLine)
  {
    print(`\t...FapEntry`);
    db.fapentries.find({'divisions': oldOrgUnits.division, 'lines': oldOrgUnits.prodLine}).forEach(fap =>
    {
      const divisions = {};

      fap.lines = fap.lines.map(line =>
      {
        line = line === oldOrgUnits.prodLine ? newOrgUnits.prodLine : line;
        divisions[lineToDivision[line]] = 1;

        return line;
      });

      db.fapentries.updateOne({_id: fap._id}, {$set: {
        lines: fap.lines,
        divisions: Object.keys(divisions)
      }});
    });
  }

  print(`\t...Setting...`);
  let setting;

  if (!same.prodLine)
  {
    print(`\t\t...production.lineAutoDowntimes`);
    setting = db.settings.findOne({_id: 'production.lineAutoDowntimes', 'value.lines': oldOrgUnits.prodLine});

    if (setting)
    {
      setting.value.forEach(lineAutoDowntimes =>
      {
        lineAutoDowntimes.lines = lineAutoDowntimes.lines.map(line =>
        {
          return line === oldOrgUnits.prodLine ? newOrgUnits.prodLine : line;
        });
      });

      db.settings.updateOne({_id: setting._id}, {$set: {value: setting.value}});
    }
  }

  if (!same.prodLine)
  {
    print(`\t\t...production.taktTime.ignoredLines`);
    setting = db.settings.findOne({_id: 'production.taktTime.ignoredLines'});

    if (setting)
    {
      setting.value = setting.value.split(',').filter(v => v.length > 0).map(line =>
      {
        return line === oldOrgUnits.prodLine ? newOrgUnits.prodLine : line;
      });

      db.settings.updateOne({_id: setting._id}, {$set: {value: setting.value.join(',')}});
    }
  }

  Object.keys(update.names || {}).forEach(orgUnitType =>
  {
    const name = update.names[orgUnitType];

    switch (orgUnitType)
    {
      case 'division':
        db.divisions.updateOne({_id: newOrgUnits.division}, {$set: {description: name}});
        break;

      case 'subdivision':
        db.subdivisions.updateOne({_id: newOrgUnits.subdivision}, {$set: {name: name}});
        break;

      case 'mrpController':
        db.mrpcontrollers.updateOne({_id: newOrgUnits.mrpControllers[0]}, {$set: {description: name}});
        break;

      case 'prodFlow':
        db.prodflows.updateOne({_id: newOrgUnits.prodFlow}, {$set: {name: name}});
        break;

      case 'workCenter':
        db.workcenters.updateOne({_id: newOrgUnits.workCenter}, {$set: {description: name}});
        break;

      case 'prodLine':
        db.prodlines.updateOne({_id: newOrgUnits.prodLine}, {$set: {description: name}});
        break;
    }
  });
});

toRemove.forEach(d =>
{
  db[d.collection].remove({_id: d._id});
});

// MANUAL

// END MANUAL

function fixFteMasterEntry(entry, update)
{
  var oldTask = null;
  var newTask = null;

  entry.tasks.forEach(task =>
  {
    if (task.id.valueOf() === update.oldOrgUnits.prodFlow.valueOf())
    {
      oldTask = task;
    }
    else if (task.id.valueOf() === update.newOrgUnits.prodFlow.valueOf())
    {
      newTask = task;
    }
  });

  if (update.fteMasterEntry.mode === 'merge')
  {
    mergeFteMasterEntry(entry, update, oldTask, newTask);
  }
  else if (update.fteMasterEntry.mode === 'transfer')
  {
    transferFteMasterEntry(entry, update, oldTask, newTask);
  }
}

function mergeFteMasterEntry(entry, update, oldTask, newTask)
{
  if (newTask)
  {
    if (!oldTask)
    {
      return;
    }

    newTask.functions.forEach((f, fI) =>
    {
      f.companies.forEach((c, cI) =>
      {
        c.count = roundFte(c.count + oldTask.functions[fI].companies[cI].count);
      });
    });

    entry.tasks = entry.tasks.filter(t => t !== oldTask);
  }
  else
  {
    oldTask.id = update.newOrgUnits.prodFlow;
  }

  db.ftemasterentries.update({_id: entry._id}, {$set: {tasks: entry.tasks}});
}

function transferFteMasterEntry(entry, update, oldTask, newTask)
{
  if (newTask && update.fteMasterEntry.ignoreNewTask)
  {
    return;
  }

  const line = update.newOrgUnits.prodLine;
  const newLineActive = db.prodshiftorders.count({
    prodLine: line,
    startedAt: {
      $gte: entry.date,
      $lt: new Date(entry.date.getTime() + 8 * 3600 * 1000)
    }
  }) > 0;

  if (!newLineActive)
  {
    return;
  }

  if (!newTask)
  {
    const newProdFlow = db.prodflows.findOne({_id: update.newOrgUnits.prodFlow});

    newTask = {
      type: 'prodFlow',
      id: newProdFlow._id,
      name: newProdFlow.name,
      noPlan: false,
      functions: [],
      total: 0
    };

    entry.tasks.push(newTask);
    entry.tasks.sort((a, b) =>
    {
      if (a.type === b.type)
      {
        return a.name.localeCompare(b.name, undefined, {numeric: true, ignorePunctuation: true});
      }

      return a.type === 'prodFlow' ? -1 : 1;
    });
  }

  const totalLineCount = (db.prodshiftorders.distinct('prodLine', {
    prodFlow: update.oldOrgUnits.prodFlow,
    startedAt: {
      $gte: entry.date,
      $lt: new Date(entry.date.getTime() + 8 * 3600 * 1000)
    }
  }) || []).length + 1;

  const copyStructure = newTask.functions.length === 0;

  oldTask.functions.forEach((fn, fnI) =>
  {
    if (copyStructure)
    {
      newTask.functions.push({
        id: fn.id,
        companies: []
      });
    }

    fn.companies.forEach((c, cI) =>
    {
      if (copyStructure)
      {
        newTask.functions[fnI].companies.push({
          id: c.id,
          name: c.name,
          count: 0
        });
      }

      const key = `${entry._id.valueOf()}.${oldTask.id.valueOf()}.${fnI}.${cI}`;

      if (fteCountPerLine[key] == null)
      {
        fteCountPerLine[key] = c.count / totalLineCount;
      }

      const countPerLine = fteCountPerLine[key];

      c.count = roundFte(c.count - countPerLine);

      newTask.functions[fnI].companies[cI].count = roundFte(
        newTask.functions[fnI].companies[cI].count + countPerLine
      );
    });
  });

  db.ftemasterentries.update({_id: entry._id}, {$set: {tasks: entry.tasks}});
}

function roundFte(fte)
{
  return Math.round(fte * 1000) / 1000;
}
