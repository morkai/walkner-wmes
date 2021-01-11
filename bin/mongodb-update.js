/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.factorylayouts.updateOne({_id: 'default'}, {$set: {
  'live.0.fillColor': '#FFFFAA',
  'live.1.fillColor': '#AADDAA',
  'live.2.fillColor': '#C0A0C0'
}});

db.settings.updateOne({_id: 'factoryLayout.LPa.color'}, {$set: {value: '#FFFFAA'}});
db.settings.updateOne({_id: 'factoryLayout.LPb.color'}, {$set: {value: '#AADDAA'}});
db.settings.updateOne({_id: 'factoryLayout.LPc.color'}, {$set: {value: '#C0A0C0'}});
