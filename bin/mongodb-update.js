/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.updateMany({'funcs.4': {$exists: false}}, {$push: {
  funcs: {
    _id: 'painter',
    user: null,
    startedAt: null,
    finishedAt: null,
    status: 'pending',
    picklist: 'pending',
    pickup: 'pending',
    carts: [],
    problemArea: '',
    comment: ''
  }
}});

db.oldwhorders.updateMany({'psDistStatus': {$exists: false}}, {$set: {
  psDistStatus: 'pending'
}});

db.oldwhsetcarts.updateMany({'pending': {$exists: false}}, {$set: {
  pending: false
}});

db.oldwhlines.find({}).forEach(whLine =>
{
  if (!Array.isArray(whLine.mrps))
  {
    whLine.mrps = [];
  }

  if (whLine.components)
  {
    whLine.available = whLine.components;

    delete whLine.components;
  }

  delete whLine.packaging;

  var whOrders = db.oldwhorders.find({
    distStatus: 'pending',
    'lines._id': whLine._id,
    status: {$in: ['started', 'finished']}
  }).toArray();
  var sets = {};

  whOrders.forEach(whOrder =>
  {
    const whOrderLine = whOrder.lines.find(({_id}) => _id === whLine._id);

    if (!whOrderLine)
    {
      return;
    }

    const key = `${whOrder.date.getTime()}:${whOrder.set}`;

    if (!sets[key])
    {
      sets[key] = {
        started: 0,
        finished: 0,
        orders: []
      };
    }

    const set = sets[key];

    set[whOrder.status] += 1;
    set.orders.push(whOrderLine);
  });

  var pickup = {
    started: {
      sets: 0,
      qty: 0,
      time: 0
    },
    finished: {
      sets: 0,
      qty: 0,
      time: 0
    },
    total: {
      sets: 0,
      qty: 0,
      time: 0
    }
  };

  Object.values(sets).forEach(set =>
  {
    const status = set.started ? 'started' : 'finished';

    pickup.total.sets += 1;
    pickup[status].sets += 1;

    set.orders.forEach(({qty, pceTime}) =>
    {
      pickup.total.qty += qty;
      pickup.total.time += qty * pceTime;
      pickup[status].qty += qty;
      pickup[status].time += qty * pceTime;
    });
  });

  whLine.pickup = pickup;

  db.oldwhlines.replaceOne({_id: whLine._id}, whLine);
});

db.oldwhlinesnapshots.createIndex({line: 1, time: -1});
db.oldwhlinesnapshots.createIndex({time: -1});
db.oldwhorders.dropIndex('lines._id_1_date_-1');
db.oldwhorders.dropIndex('psStatus_1_date_-1');
db.oldwhorders.dropIndex('funcs.user.id_1_funcs.status_1_funcs.finishedAt_1');
db.oldwhsetcarts.dropIndex('line_1_date_-1');
db.paintshoporders.dropIndex('status_1');
db.plans.dropIndex('orders._id_-1');
db.users.dropIndex('lastName_1');
db.oldwhpendingcomponents.drop();
db.oldwhpendingpackagings.drop();

try
{
  db.users.insertMany([
    {
      "_id": new ObjectId("5ed7904547b92e3eb07a7dfc"),
      "prodFunction": null,
      "privileges": [
        "WH:VIEW"
      ],
      "aors": [],
      "mrps": [],
      "orgUnitType": "unspecified",
      "orgUnitId": null,
      "kdId": -1,
      "vendor": null,
      "gender": "unknown",
      "presence": false,
      "apiKey": "",
      "mobile": [],
      "login": "test-wh-painter-2",
      "password": "$2b$10$Izm4kKm1vG3Ba.2xc8/P..shH/u.Mbw7cGbkbxFHkqPu/sPmXXg7e",
      "active": true,
      "firstName": "PAINTER 2",
      "lastName": "TEST",
      "cardUid": "13370032",
      "preferences": {
        "fap_sms": false,
        "fm24_sms": false,
        "fm24_email": false
      },
      "personellId": "",
      "email": "",
      "company": null,
      "card": null,
      "searchName": "TESTPAINTER2",
      "__v": 0
    },
    {
      "_id": new ObjectId("5ed7902147b92e3eb07a7df3"),
      "prodFunction": null,
      "privileges": [
        "WH:VIEW"
      ],
      "aors": [],
      "mrps": [],
      "orgUnitType": "unspecified",
      "orgUnitId": null,
      "kdId": -1,
      "vendor": null,
      "gender": "unknown",
      "presence": false,
      "apiKey": "",
      "mobile": [],
      "login": "test-wh-painter-1",
      "password": "$2b$10$tUn/p8M4AZpEDzOikI3SguIJDMGXnKsL7G2FcNjXtrREVWOUVXcD6",
      "active": true,
      "firstName": "PAINTER 1",
      "lastName": "TEST",
      "preferences": {
        "fap_sms": false,
        "fm24_sms": false,
        "fm24_email": false
      },
      "personellId": "",
      "email": "",
      "company": null,
      "card": null,
      "cardUid": "13370071",
      "searchName": "TESTPAINTER1",
      "__v": 0
    }
  ], {ordered: false});
}
catch (x) {}

try
{
  db.oldwhusers.insertMany([
    {
      "_id": "5ed7904547b92e3eb07a7dfc",
      "label": "TEST PAINTER 2",
      "func": "painter"
    },
    {
      "_id": "5ed7902147b92e3eb07a7df3",
      "label": "TEST PAINTER 1",
      "func": "painter"
    }
  ]);
}
catch (x) {}
