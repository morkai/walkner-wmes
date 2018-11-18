/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.orderetos.find({}, {html: 0}).forEach(d =>
{
  let constructorUser = d.constructorUser || d.constructor;

  if (typeof constructorUser !== 'string')
  {
    constructorUser = '';
  }

  db.orderetos.updateOne({_id: d._id}, {$unset: {constructor: 1}, $set: {constructorUser}});
});
