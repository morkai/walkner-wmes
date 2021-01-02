/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.paintshoploadreasons.insertMany([
  {
    "_id" : ObjectId("5fedec03b3b33925c8fe05e5"),
    "active" : true,
    "position" : 9999,
    "label" : "Inne"
  },
  {
    "_id" : ObjectId("5fedebfcb3b33925c8fe05e4"),
    "active" : true,
    "position" : 30,
    "label" : "Brak trawersy"
  },
  {
    "_id" : ObjectId("5fedebeeb3b33925c8fe05e3"),
    "active" : true,
    "position" : 20,
    "label" : "Pełny piec"
  },
  {
    "_id" : ObjectId("5fedebe6b3b33925c8fe05e2"),
    "active" : true,
    "position" : 10,
    "label" : "Przezbrojenie"
  }
])
