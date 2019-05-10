/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

print('toolcaltools...');

db.toolcaltools.find({}, {users: 1}).forEach(function(tool)
{
  db.toolcaltools.updateOne({_id: tool._id}, {$set: {
    users: tool.users.map(u =>
    {
      u.kind = u.kind || 'individual';

      return u;
    })
  }});
});

print('paintshoporders...');

db.paintshoporders.find({'childOrders.mrp': {$exists: false}}, {childOrders: 1}).forEach(pso =>
{
  pso.childOrders.forEach(childOrder =>
  {
    var sapOrder = db.orders.findOne({_id: childOrder.order}, {mrp: 1});

    childOrder.mrp = sapOrder ? sapOrder.mrp : null;
  });

  db.paintshoporders.updateOne({_id: pso._id}, {$set: {childOrders: pso.childOrders}});
});

print('orderdocumentfiles...');

db.orderdocumentfiles.find({}).forEach(odf =>
{
  var changes = db.orderdocumentchanges.find({nc15: odf._id}).toArray();

  if (!changes.length)
  {
    return;
  }

  var files = {};
  var $set = {
    updater: null,
    updatedAt: null,
    files: odf.files
  };

  odf.files.forEach(f =>
  {
    f.updater = null;
    f.updatedAt = null;
    files[f.hash] = f;
  });

  changes.forEach(change =>
  {
    $set.updater = change.user;
    $set.updatedAt = change.time;

    if (!change.data || !Array.isArray(change.data.files))
    {
      return;
    }

    change.data.files.forEach(changeFile =>
    {
      var file = files[changeFile.hash];

      if (!file)
      {
        return;
      }

      if (!file.updater || file.date.getTime() !== changeFile.date.getTime())
      {
        file.updater = change.user;
        file.updatedAt = change.time;
      }
    });
  });

  db.orderdocumentfiles.updateOne({_id: odf._id}, {$set});
});
