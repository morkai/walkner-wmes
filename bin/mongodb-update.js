/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var map = {};

print('Fetching components...');

db.orders.find({}, {'bom.nc12': 1, 'bom.name': 1}).forEach(o =>
{
  if (!Array.isArray(o.bom))
  {
    return;
  }

  o.bom.forEach(c =>
  {
    if (c.nc12.length !== 0)
    {
      map[c.nc12] = c.name;
    }
  });
});

var list = [];

Object.keys(map).forEach(nc12 =>
{
  list.push({
    _id: nc12,
    name: map[nc12]
  });
});

print('Removing components...');

db.components.deleteMany({});

print('Inserting components...');

while (list.length)
{
  var chunk = list.splice(0, 100);

  db.components.insertMany(chunk);
}
