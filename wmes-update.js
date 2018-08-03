/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbansupplyareas.update({}, {$unset: {markerColor: 1}}, {multi: true});
db.kanbancomponents.update({}, {$set: {markerColor: null}}, {multi: true});
