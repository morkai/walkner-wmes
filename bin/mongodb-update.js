/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.users.dropIndex({kdId: 1});
db.users.dropIndex({personellId: 1});

const old2new = {
  kdPosition: 'jobTitle',
  kdWorkplace: 'workplace',
  kdDivision: 'division',
  kdCompany: 'company'
};
const oldKeys = Object.keys(old2new);

db.users.find({kdId: {$exists: true}}).forEach(u =>
{
  u.syncId = null;

  if (u.kdId > 0)
  {
    u.syncId = u.kdId.toString();

    delete u.kdId;
  }

  const d = u.syncData = {};

  oldKeys.forEach(oldKey =>
  {
    const value = u[oldKey];

    delete u[oldKey];

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
db.users.updateMany({syncId: null}, {$set: {syncId: ''}});
db.users.updateMany({email: null}, {$set: {email: ''}});
db.users.updateMany({personnelId: null}, {$set: {personnelId: ''}});
db.users.updateMany({card: null}, {$set: {card: ''}});
db.users.updateMany({card: 'null'}, {$set: {card: ''}});
db.users.updateMany({cardUid: null}, {$set: {cardUid: ''}});
db.users.updateMany({preferences: null}, {$set: {preferences: {}}});
db.users.updateMany({preferences: {$exists: false}}, {$set: {preferences: {}}});

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

db.oshdivisions.updateMany({syncPatterns: {$exists: false}}, {$set: {syncPatterns: ''}});

db.settings.update({_id: "wh.planning.minTimeForDelivery", value: {$type: 'number'}}, {
  $set: {
    "value": {
      "*": 90
    }
  }
});

db.users.updateOne({_id: new ObjectId('57fde23cacc4c609648bd4fd')}, {$set: {
  "personnelId": "46252256",
  "card": "115204",
  company: 'PHILIPS',
  syncId: '23088',
  syncData: {
    "company": "PHILIPS",
    "division": "MDe ETO",
    "jobTitle": "Konstruktor"
  }
}});
