/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.plansettings.update({}, {$set: {completedStatuses: ['DLV', 'CNF']}}, {multi: true});
