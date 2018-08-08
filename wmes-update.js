/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbanentries.update({}, {$set: {workCenter: ''}}, {multi: true});
