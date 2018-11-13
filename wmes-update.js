/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.qikinds.updateMany({}, {$set: {position: 0}});

const kinds = [
  {
    "_id": "570ad89c06c446d0ba410364",
    "name": "Proces - kompletacja komponentów",
    "position": 8000
  },
  {
    "_id": "570ad89c06c446d0ba410365",
    "name": "Wyrób - magazyn wyrobów gotowych",
    "position": 3000
  },
  {
    "_id": "570ad89c06c446d0ba410366",
    "name": "Proces - montaż",
    "position": 5000
  },
  {
    "_id": "570ad89c06c446d0ba410367",
    "name": "Wyrób",
    "position": 1000
  },
  {
    "_id": "5808c73b7fcea814c4a0277a",
    "name": "Kompletacja komponentów",
    "position": 9000
  },
  {
    "_id": "5bb5f268108d460760773146",
    "name": "Szkolenie - ogólne dla nowych pracowników",
    "position": 11000
  },
  {
    "_id": "5bb607fb5f49f5143454cbd8",
    "name": "Proces - montaż - ETO pilot",
    "position": 7000
  },
  {
    "_id": "5bb608265f49f5143454cbdc",
    "name": "Proces - montaż - SPC",
    "position": 6000
  },
  {
    "_id": "5bb6083f5f49f5143454cbde",
    "name": "Wyrób gotowy - zwrot transportowy",
    "position": 4000
  },
  {
    "_id": "5bb6085c5f49f5143454cbe0",
    "name": "Szkolenie jakościowe - trenerskie",
    "position": 10000
  },
  {
    "_id": "5bea949148c585162400b1df",
    "name": "Wyrób - seria próbna",
    "position": 2000
  }
];

kinds.forEach(k =>
{
  db.qikinds.updateOne({_id: new ObjectId(k._id)}, {$set: {position: k.position}});
});

var toRemove = [

];
var toUpdate = [
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH1'],
      prodFlow: new ObjectId('5974b50436d51b12462c6c22'),
      workCenter: 'ARENA2-1',
      prodLine: 'LM-37'
    },
    newOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH1'],
      prodFlow: new ObjectId('5974b50436d51b12462c6c22'),
      workCenter: 'ARENA2-1',
      prodLine: 'LM-37'
    },
    names: {
      prodFlow: 'Arena Vision/Opti Vision/Power Vision/Comfort Vision - Montaż Główny - LM-37'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH1'],
      prodFlow: new ObjectId('5974b50536d51b12462c6c23'),
      workCenter: 'ARENA2-2',
      prodLine: 'LM-38'
    },
    newOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH1'],
      prodFlow: new ObjectId('5974b50536d51b12462c6c23'),
      workCenter: 'ARENA2-2',
      prodLine: 'LM-38'
    },
    names: {
      prodFlow: 'Arena Vision/Opti Vision/Power Vision/Comfort Vision - Montaż Główny - LM-38'
    },
    fteMasterEntry: null
  }
];

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
  var newProdLine = db.prodlines.findOne({_id: newOrgUnits.prodLine});

  if (!newProdLine && oldProdLine)
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
    fromTo('date', update, false, {prodLine: oldProdLine._id}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdShiftOrder`);
  db.prodshiftorders.update(
    fromTo('date', update, false, {prodLine: oldProdLine._id}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdDowntime`);
  db.proddowntimes.update(
    fromTo('date', update, false, {prodLine: oldProdLine._id}),
    {$set: $set1},
    {multi: true}
  );

  print(`\t...ProdLogEntry`);
  print(`\t\t...1`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldProdLine._id, 'data.startedProdShift.prodLine': oldProdLine._id}),
    {$set: $set3},
    {multi: true}
  );
  print(`\t\t...2`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldProdLine._id, 'data.prodLine': oldProdLine._id}),
    {$set: $set2},
    {multi: true}
  );
  print(`\t\t...3`);
  db.prodlogentries.update(
    fromTo('createdAt', update, true, {prodLine: oldProdLine._id}),
    {$set: $set1},
    {multi: true}
  );

  if (!same.division || !same.prodLine)
  {
    print(`\t...PressWorksheets`);
    db.pressworksheets.find(fromTo('date', update, false, {prodLines: oldProdLine._id})).forEach(pw =>
    {
      var divisions = {};
      var prodLines = {};

      pw.orders.forEach(o =>
      {
        if (o.prodLine === oldProdLine._id)
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
    fromTo('time', update, true, {orgUnits: {type: 'prodLine', id: oldProdLine._id}}),
    {$set: {orgUnits: orgUnitList}},
    {multi: true}
  );

  print(`\t...IsaRequest`);
  db.isarequests.update(
    fromTo('requestedAt', update, true, {orgUnits: {type: 'prodLine', id: oldProdLine._id}}),
    {$set: {orgUnits: orgUnitList}},
    {multi: true}
  );

  if (!same.division || !same.prodLine)
  {
    print(`\t...QiResult`);
    db.qiresults.update(
      fromTo('inspectedAt', update, true, {line: oldProdLine._id}),
      {$set: {line: newProdLine._id, division: newOrgUnits.division}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...ProdSerialNumber`);
    db.prodserialnumbers.update(
      fromTo('scannedAt', update, true, {line: oldProdLine._id}),
      {$set: {prodLine: newProdLine._id}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...WhOrderStatus`);
    db.whorderstatuses.find(fromTo('_id.date', update, true, {'_id.line': oldProdLine._id})).forEach(whOrderStatus =>
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
      fromTo('date', update, true, {line: oldProdLine._id}),
      {$set: {line: newProdLine._id}},
      {multi: true}
    );
  }

  if (!same.prodLine)
  {
    print(`\t...Plan`);
    db.plansettings.find(fromTo('_id', update, true, {'lines._id': oldProdLine._id})).forEach(planSettings =>
    {
      planSettings.lines.find(l => l._id === oldProdLine._id)._id = newProdLine._id;

      planSettings.mrps.forEach(planMrpSettings =>
      {
        planMrpSettings.lines = planMrpSettings.lines.map(line =>
        {
          line._id = line._id === oldProdLine._id ? newProdLine._id : line._id;

          return line;
        });

        planMrpSettings.groups.forEach(group =>
        {
          group.lines = group.lines.map(line => line === oldProdLine._id ? newProdLine._id : line);
        });
      });

      db.plansettings.update({_id: planSettings._id}, planSettings);

      var plan = db.plans.findOne({_id: planSettings._id});

      plan.lines.find(l => l._id === oldProdLine._id)._id = newProdLine._id;

      plan.orders.forEach(planOrder =>
      {
        planOrder.lines = planOrder.lines.map(line => line === oldProdLine._id ? newProdLine._id : line);
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

  print(`\t...names...`);
  Object.keys(update.names || {}).forEach(orgUnitType =>
  {
    print(`\t\t...${orgUnitType}`);

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

  if (update.fteMasterEntry === 'merge')
  {
    mergeFteMasterEntry(entry, update, oldTask, newTask);
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
        c.count += oldTask.functions[fI].companies[cI].count;
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
