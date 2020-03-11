/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.componentlabels.updateMany({global: {$exists: false}}, {$set: {global: true}});
