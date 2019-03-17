/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

var FAP_CATEGORY_TO_SUBDIVISION_TYPE = {
  '5544b9182b5949f80d80b369': 'assembly',
  '5c61352b1af9c90ba4c8b28c': 'wh',
  '5c124e581f1a7d2ee3fcd338': 'assembly',
  '5544b9552b5949f80d80b383': 'wh',
  '5544b94d2b5949f80d80b37d': 'assembly',
  '5c134f241f1a7d2ee3fcd33c': 'assembly',
  '5544b9422b5949f80d80b379': 'assembly',
  '5c134ed71f1a7d2ee3fcd33b': 'assembly',
  '5bcdce0a46f003084ca86611': 'assembly',
  '5c2cace1da65f30fc004c8e3': 'assembly',
  '5c73c5049383030ff4e2ee03': 'assembly',
  '5bcdce2146f003084ca86615': 'assembly',
  '5bcdce3746f003084ca86619': 'assembly',
  '5544b9402b5949f80d80b377': 'assembly',
  '5544b9572b5949f80d80b385': 'assembly'
};

db.fapentries.find({subdivisionType: 'unspecified'}, {changes: 0}).forEach(fap =>
{
  var subdivisionType = FAP_CATEGORY_TO_SUBDIVISION_TYPE[fap.category.valueOf()];

  if (!subdivisionType)
  {
    if (fap.search[0].includes('zablokowac'))
    {
      subdivisionType = 'wh';
    }
  }

  if (subdivisionType)
  {
    db.fapentries.updateOne({_id: fap._id}, {$set: {subdivisionType}});
  }
});

db.ftemasterentries.find({'tasks.noPlan': true}).forEach(entry =>
{
  let changed = false;

  entry.tasks.forEach(task =>
  {
    if (!task.noPlan || task.total === 0)
    {
      return;
    }

    changed = true;

    task.total = 0;

    task.functions.forEach(fn =>
    {
      fn.companies.forEach(c =>
      {
        c.count = 0;
      });
    });
  });

  if (changed)
  {
    db.ftemasterentries.updateOne({_id: entry._id}, {$set: {tasks: entry.tasks}});
  }
});
