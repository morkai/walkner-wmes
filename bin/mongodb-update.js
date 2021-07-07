/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.settings.updateOne({_id: 'users.presence.lastRecord'}, {$set: {value: 850000}});
db.settings.updateOne({_id: 'users.presence.hardware'}, {$set: {value: "10089:1 Brama główna 1\n10082:1 Brama główna 2\n10079:1 Bramka uchylna na portierni"}});
