/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbansupplyareas.update({}, {$set: {markerColor: null}}, {multi: true});

db.whorders.update({}, {$set: {picklistDone: null}}, {multi: true});
