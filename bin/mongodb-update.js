/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.fapentries.createIndex({'changes.user.id': 1});

db.comprelfuncs.insertMany([
  {
    _id: 'designer',
    mor: 'mrp',
    users: []
  },
  {
    _id: 'designer_eto',
    mor: 'all',
    users: []
  },
  {
    _id: 'process-engineer',
    mor: 'mrp',
    users: []
  },
  {
    _id: 'laboratory',
    mor: 'mrp',
    users: []
  },
  {
    _id: 'electronics-engineer',
    mor: 'none',
    users: [{
      id: '5298cfce362a3f001f000b62',
      label: 'Osiński Paweł'
    }]
  }
]);

db.prodfunctions.insertMany([{
  "_id" : "electronics-engineer",
  "direct" : false,
  "dirIndirRatio" : 100,
  "color" : "#000000",
  "label" : "Elektronik",
  "__v" : 0
}, {
  "_id" : "laboratory",
  "direct" : false,
  "dirIndirRatio" : 100,
  "color" : "#000000",
  "label" : "Laboratorium",
  "__v" : 0
}]);
