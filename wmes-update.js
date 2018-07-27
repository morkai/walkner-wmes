/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbancomponents.update({}, {$set: {newStorageBin: ''}}, {multi: true});
