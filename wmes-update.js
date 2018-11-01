/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

// Recount
// /fix/clip/count-daily-mrp?from=2018-01-01
// /fix/fteMasterEntries/recount-totals?date=2018-01-01

var toRemove = [
  {collection: 'prodlines', _id: 'MCL3'}
];
var toUpdate = [
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH9'],
      prodFlow: new ObjectId('584435222b4295a7fb91ee5c'),
      workCenter: 'OUTD4-3',
      prodLine: 'LM-35'
    },
    newOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH3'],
      prodFlow: new ObjectId('584435222b4295a7fb91ee5c'),
      workCenter: 'OUTDOOR7-2',
      prodLine: 'LM-35'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH3'],
      prodFlow: new ObjectId('52d4fbb2303534c02600048f'),
      workCenter: 'OUTDOOR7',
      prodLine: 'MT'
    },
    newOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH3'],
      prodFlow: new ObjectId('52d4fbb2303534c02600048f'),
      workCenter: 'OUTDOOR7',
      prodLine: 'LM-36'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH3'],
      prodFlow: new ObjectId('53428a40c1707b6815a9b123'),
      workCenter: 'WLIGHT',
      prodLine: 'MT_PAK'
    },
    newOrgUnits: {
      division: 'LPb',
      subdivision: new ObjectId('529f266ccd8eea9824000014'),
      mrpControllers: ['KH3'],
      prodFlow: new ObjectId('53428a40c1707b6815a9b123'),
      workCenter: 'WLIGHT',
      prodLine: 'LM-36_PAK'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490b001'),
      workCenter: 'WATERACC-1',
      prodLine: 'WB-1'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490b001'),
      workCenter: 'WATERACC-1',
      prodLine: 'WB-1'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490b002'),
      workCenter: 'WATERACC-2',
      prodLine: 'WB-2'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490b002'),
      workCenter: 'WATERACC-2',
      prodLine: 'WB-2'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490b003'),
      workCenter: 'WATERACC-3',
      prodLine: 'WB-3'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490b003'),
      workCenter: 'WATERACC-3',
      prodLine: 'WB-3'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490b004'),
      workCenter: 'WATERACC-4',
      prodLine: 'WB-4'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490b004'),
      workCenter: 'WATERACC-4',
      prodLine: 'WB-4'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490c001'),
      workCenter: 'WATERSUB-1',
      prodLine: 'WU-1'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490c001'),
      workCenter: 'WATERSUB-1',
      prodLine: 'WU-1'
    },
    fteMasterEntry: null
  },
  {
    from: null,
    to: null,
    oldOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KE3'],
      prodFlow: new ObjectId('5607326b1b7251582490c002'),
      workCenter: 'WATERSUB-2',
      prodLine: 'WU-2'
    },
    newOrgUnits: {
      division: 'LPc',
      subdivision: new ObjectId('529f2685cd8eea9824000018'),
      mrpControllers: ['KF9'],
      prodFlow: new ObjectId('5607326b1b7251582490c002'),
      workCenter: 'WATERSUB-2',
      prodLine: 'WU-2'
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
  print(`${update.oldOrgUnits.prodLine} -> ${update.newOrgUnits.prodLine}...`);

  var oldProdLine = db.prodlines.findOne({_id: update.oldOrgUnits.prodLine});

  if (!oldProdLine)
  {
    return;
  }

  var newOrgUnits = update.newOrgUnits;
  var newProdLine = db.prodlines.findOne({_id: newOrgUnits.prodLine});

  if (!newProdLine)
  {
    newProdLine = Object.assign({}, oldProdLine, {
      _id: newOrgUnits.prodLine,
      workCenter: newOrgUnits.workCenter
    });

    db.prodlines.insert(newProdLine);
  }

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
        o.division = update.newOrgUnits.division;
      }

      divisions[o.division] = 1;
      prodLines[o.prodLine] = 1;
    });

    pw.divisions = Object.keys(divisions);
    pw.prodLines = Object.keys(prodLines);

    db.pressworksheets.update({_id: pw._id}, pw);
  });

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

  print(`\t...QiResult`);
  db.qiresults.update(
    fromTo('inspectedAt', update, true, {line: oldProdLine._id}),
    {$set: {line: newProdLine._id, division: newOrgUnits.division}},
    {multi: true}
  );

  print(`\t...ProdSerialNumber`);
  db.prodserialnumbers.update(
    fromTo('scannedAt', update, true, {line: oldProdLine._id}),
    {$set: {prodLine: newProdLine._id}},
    {multi: true}
  );

  print(`\t...WhOrderStatus`);
  db.whorderstatuses.find(fromTo('_id.date', update, true, {'_id.line': oldProdLine._id})).forEach(whOrderStatus =>
  {
    db.whorderstatuses.remove({_id: whOrderStatus._id});

    whOrderStatus._id.line = newProdLine._id;

    db.whorderstatuses.insert(whOrderStatus);
  });

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

  if (update.fteMasterEntry)
  {
    print(`\t...FteMasterEntry`);

    db.ftemasterentries
      .find({subdivision: newOrgUnits.subdivision, 'tasks.id': update.oldOrgUnits.prodFlow})
      .forEach(entry => fixFteMasterEntry(entry, update));
  }
});

toRemove.forEach(d =>
{
  db[d.collection].remove({_id: d._id});
});

// MANUAL

print('OrderEtos...');
db.orderetos.find({}, {updatedAt: 1}).forEach(o =>
{
  if (typeof o.updatedAt !== 'string')
  {
    return;
  }

  db.orderetos.updateOne({_id: o._id}, {$set: {updatedAt: new Date(o.updatedAt)}});
});

print('LM-35...');
(function() // eslint-disable-line
{
  var wc = db.workcenters.findOne({_id: 'OUTD4-3'});

  if (!wc) { return; }

  db.workcenters.deleteOne({_id: wc._id});

  wc._id = 'OUTDOOR7-2';
  wc.description = 'Montaż Metronomis/TownGuide - LM-35';

  db.workcenters.insert(wc);

  db.prodflows.updateOne({_id: new ObjectId('584435222b4295a7fb91ee5c')}, {$set: {description: wc.description}});
})();

print('prod flows...');
toUpdate.forEach(update =>
{
  db.prodflows.updateOne({_id: update.newOrgUnits.prodFlow}, {$set: {mrpController: update.newOrgUnits.mrpControllers}});
});

print('KE3');
db.mrpcontrollers.updateOne({_id: 'KE3'}, {$set: {subdivision: new ObjectId('529f264acd8eea9824000010')}});

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
