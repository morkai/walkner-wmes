/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.orderdocumentfiles.updateMany({stations: {$exists: false}}, {$set: {stations: []}});

db.minutesforsafetycards.updateOne({_id: new ObjectId('5d52fcb15b0f5c27883978a9')}, {$set: {confirmer: null}});
