/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.users.dropIndex({kdId: 1});
db.users.dropIndex({personellId: 1});

const old2new = {
  kdId: 'id',
  kdPosition: 'jobTitle',
  kdWorkplace: 'workplace',
  kdDivision: 'division',
  kdCompany: 'company'
};
const oldKeys = Object.keys(old2new);

db.users.find({kdId: {$exists: true}}).forEach(u =>
{
  u.syncId = null;

  const d = u.syncData = {};

  oldKeys.forEach(oldKey =>
  {
    const value = u[oldKey];

    delete u[oldKey];

    if (oldKey === 'kdId')
    {
      if (value > 0)
      {
        u.syncId = String(value);
      }
      else
      {
        return;
      }

      return;
    }

    if (!!value || value === 0)
    {
      const newKey = old2new[oldKey];

      d[newKey] = value;
    }
  });

  db.users.replaceOne({_id: u._id}, u);
});

db.users.find({personellId: {$exists: true}}).forEach(u =>
{
  db.users.updateOne({_id: u._id}, {
    $set: {personnelId: u.personellId},
    $unset: {personellId: 1}
  });
});

db.users.updateMany({}, {$unset: {sapPosition: 1, division: 1, registerDate: 1}});

db.users.createIndex({syncId: 1});
db.users.createIndex({personnelId: 1});

db.oldwhsetcarts.find({}).forEach(setCart =>
{
  setCart.orders.forEach(o =>
  {
    const sapOrder = db.orders.findOne({_id: o.sapOrder}, {mrp: 1});

    if (sapOrder)
    {
      o.mrp = sapOrder.mrp;
    }
  });

  db.oldwhsetcarts.updateOne({_id: setCart._id}, {$set: {orders: setCart.orders}});
});

db.settings.update({_id: "wh.planning.minTimeForDelivery"}, {
  $set: {
    "value": {
      "*": 90
    }
  }
});
