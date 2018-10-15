/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.delayreasons.update({}, {$set: {
  active: true,
  drm: {
    man: '',
    machine: '',
    material: '',
    method: ''
  }
}}, {multi: true});
