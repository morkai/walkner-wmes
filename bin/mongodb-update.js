/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var now = new Date();

db.settings.find({}).forEach(s =>
{
  db.settingchanges.insertOne({
    setting: s._id,
    time: s.updatedAt || now,
    user: s.user || {id: null, label: 'System'},
    value: s.value
  });
});
