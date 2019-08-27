/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.minutesforsafetycards.updateMany({status: {$exists: true}}, {
  $unset: {status: 1},
  $set: {confirmer: null, risks: '', causes: []}
});
