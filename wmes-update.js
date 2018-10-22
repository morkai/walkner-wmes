/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.delayreasons.update({}, {$set: {drm: ''}}, {multi: true});
