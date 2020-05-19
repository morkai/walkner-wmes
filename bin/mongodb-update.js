/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.settings.updateOne({_id: 'wh.planning.ignorePsStatus'}, {$set: {value: ['new', 'cancelled']}});
