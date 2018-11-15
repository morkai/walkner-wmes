/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.events.updateMany({type: 'minutesForSafety.deleted'}, {$set: {type: 'minutesForSafetyCards.deleted'}});
