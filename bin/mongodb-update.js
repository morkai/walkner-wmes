/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';


db.settings.deleteOne({_id: 'paintShop.load.delayedDuration'});
db.settings.deleteOne({_id: 'paintShop.load.delayedDuration.1'});
db.settings.deleteOne({_id: 'paintShop.load.delayedDuration.2'});
db.settings.deleteOne({_id: 'paintShop.load.delayedDuration.3'});
db.settings.deleteOne({_id: 'paintShop.load.statuses'});
db.settings.deleteOne({_id: 'paintShop.load.statuses.1'});
db.settings.deleteOne({_id: 'paintShop.load.statuses.2'});
db.settings.deleteOne({_id: 'paintShop.load.statuses.3'});

var updatedAt = new Date();
var updater = {id: null, label: 'System'};

db.settings.insertOne({
  "_id": "paintShop.load.statuses.1",
  "value": [
    {
      "from": 0,
      "to": 150,
      "icon": "smile-o",
      "color": "#00af00"
    },
    {
      "from": 150,
      "to": 200,
      "icon": "meh-o",
      "color": "#ffaa00"
    },
    {
      "from": 200,
      "to": 0,
      "icon": "frown-o",
      "color": "#ee0000"
    }
  ],
  updatedAt,
  updater
});

db.settings.insertOne({
  "_id": "paintShop.load.statuses.2",
  "value": [
    {
      "from": 0,
      "to": 150,
      "icon": "smile-o",
      "color": "#00af00"
    },
    {
      "from": 150,
      "to": 200,
      "icon": "meh-o",
      "color": "#ffaa00"
    },
    {
      "from": 200,
      "to": 0,
      "icon": "frown-o",
      "color": "#ee0000"
    }
  ],
  updatedAt,
  updater
});

db.settings.insertOne({
  "_id": "paintShop.load.statuses.3",
  "value": [
    {
      "from": 0,
      "to": 150,
      "icon": "smile-o",
      "color": "#00af00"
    },
    {
      "from": 150,
      "to": 200,
      "icon": "meh-o",
      "color": "#ffaa00"
    },
    {
      "from": 200,
      "to": 0,
      "icon": "frown-o",
      "color": "#ee0000"
    }
  ],
  updatedAt,
  updater
});

db.settings.insertMany([
  {
    "_id": "paintShop.load.delayedDuration.1",
    "value": 200,
    updatedAt,
    updater
  },
  {
    "_id": "paintShop.load.delayedDuration.2",
    "value": 200,
    updatedAt,
    updater
  },
  {
    "_id": "paintShop.load.delayedDuration.3",
    "value": 200,
    updatedAt,
    updater
  }
]);
