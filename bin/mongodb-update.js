/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.comprelfuncs.insertOne({
  _id: "production-planner",
  "mor": "mrp",
  "users": []
});

db.comprelentries.createIndex({reason: 1});

db.comprelentries.updateMany({reason: {$exists: false}}, {$set: {reason: ObjectId("5f459ed0b79aa826182a6c13")}});

db.comprelreasons.insertMany([
  /* 1 createdAt:2020-08-26T01:29:43+02:00*/
  {
    "_id" : ObjectId("5f459ee7b79aa826182a6c1f"),
    "active" : true,
    "name" : "Konstrukcja",
    "__v" : 0
  },

  /* 2 createdAt:2020-08-26T01:29:35+02:00*/
  {
    "_id" : ObjectId("5f459edfb79aa826182a6c1b"),
    "active" : true,
    "name" : "Opóźnienie dostawy",
    "__v" : 0
  },

  /* 3 createdAt:2020-08-26T01:29:27+02:00*/
  {
    "_id" : ObjectId("5f459ed7b79aa826182a6c17"),
    "active" : true,
    "name" : "Rozbierzność stanu",
    "__v" : 0
  },

  /* 4 createdAt:2020-08-26T01:29:20+02:00*/
  {
    "_id" : ObjectId("5f459ed0b79aa826182a6c13"),
    "active" : true,
    "name" : "Prognoza",
    "__v" : 0
  },

  /* 5 createdAt:2020-08-26T01:29:13+02:00*/
  {
    "_id" : ObjectId("5f459ec9b79aa826182a6c0f"),
    "active" : true,
    "name" : "Przestarzały",
    "__v" : 0
  },

  /* 6 createdAt:2020-08-26T01:29:02+02:00*/
  {
    "_id" : ObjectId("5f459ebeb79aa826182a6c0b"),
    "active" : true,
    "name" : "Ankieta zmian",
    "__v" : 0
  },

  /* 7 createdAt:2020-08-26T00:48:01+02:00*/
  {
    "_id" : ObjectId("5f45952191623d45e0721999"),
    "active" : true,
    "name" : "Jakość",
    "__v" : 0
  }
]);
