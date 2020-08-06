/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.drillingorders.distinct('order').forEach(orderId =>
{
  var all = 0;
  var statuses = {
    new: 0,
    started: 0,
    partial: 0,
    finished: 0,
    aside: 0,
    cancelled: 0
  };

  db.drillingorders.find({order: orderId}, {_id: 0, status: 1}).forEach(o =>
  {
    all += 1;
    statuses[o.status] += 1;
  });

  var newStatus = 'new';

  if (statuses.partial)
  {
    newStatus = 'partial';
  }
  else if (statuses.started)
  {
    newStatus = 'started';
  }
  else if (statuses.aside === all)
  {
    newStatus = 'aside';
  }
  else if (statuses.finished)
  {
    newStatus = (statuses.finished + statuses.cancelled) === all ? 'finished' : 'partial';
  }
  else if (statuses.aside)
  {
    newStatus = 'aside';
  }
  else if (statuses.cancelled === all)
  {
    newStatus = 'cancelled';
  }

  db.orders.updateOne({_id: orderId}, {$set: {drillStatus: newStatus}});
  db.oldwhorders.updateMany({order: orderId, psStatus: 'unknown'}, {$set: {
    psStatus: newStatus,
    drilling: newStatus !== 'unknown'
  }});
});

db.oldwhorders.updateMany(
  {date: {$gt: new Date('2020-04-08T00:00:00Z')}, drilling: {$exists: false}},
  {$set: {drilling: false}}
);

db.orders.updateMany(
  {scheduledStartDate: {$gt: new Date('2020-04-08T00:00:00Z')}, drillStatus: {$exists: false}},
  {$set: {drillStatus: 'unknown'}}
);

try
{
  db.oldwhredirreasons.insertMany([
    /* 1 createdAt:2020-08-04T21:00:43.000Z*/
    {
      "_id" : ObjectId("5f29cc7bb2ccd433a0703896"),
      "active" : true,
      "label" : "Złe rozplanowanie (błąd ludzki)"
    },

    /* 2 createdAt:2020-08-04T21:00:31.000Z*/
    {
      "_id" : ObjectId("5f29cc6fb2ccd433a0703893"),
      "active" : true,
      "label" : "Zlecenie przekierowania osób trzecich"
    },

    /* 3 createdAt:2020-08-04T21:00:25.000Z*/
    {
      "_id" : ObjectId("5f29cc69b2ccd433a0703890"),
      "active" : true,
      "label" : "Wydajność"
    },

    /* 4 createdAt:2020-08-04T21:00:17.000Z*/
    {
      "_id" : ObjectId("5f29cc61b2ccd433a070388d"),
      "active" : true,
      "label" : "Puste pole 10 minut przy linii w ciągu zmiany"
    },

    /* 5 createdAt:2020-08-04T21:00:10.000Z*/
    {
      "_id" : ObjectId("5f29cc5ab2ccd433a070388a"),
      "active" : true,
      "label" : "Puste pole 10 minut przy linii na rano"
    },

    /* 6 createdAt:2020-08-04T20:59:58.000Z*/
    {
      "_id" : ObjectId("5f29cc4eb2ccd433a070385c"),
      "active" : true,
      "label" : "Koniec planu produkcji w danym dniu na daną linię"
    },

    /* 7 createdAt:2020-08-04T20:54:18.000Z*/
    {
      "_id" : ObjectId("5f29cafab2ccd433a0703826"),
      "active" : true,
      "label" : "Brak detali z malarni na czas"
    },

    /* 8 createdAt:2020-08-04T20:53:11.000Z*/
    {
      "_id" : ObjectId("5f29cab7b2ccd433a070381f"),
      "active" : true,
      "label" : "Błąd operatora produkcji"
    }
  ], {ordered: false});
}
catch (err) {}
