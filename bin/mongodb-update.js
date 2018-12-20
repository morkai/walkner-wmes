/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.fapcategories.updateMany({users: {$exists: false}}, {$set: {users: []}});
db.fapcategories.updateMany({subdivisions: {$exists: false}}, {$set: {subdivisions: []}});

db.fapentries.find({}).forEach(entry =>
{
  if (entry.solutionSteps !== undefined)
  {
    return;
  }

  db.fapentries.updateOne({_id: entry._id}, {$set: {
    solution: '',
    solutionSteps: entry.solution
  }});
});

db.opinionsurveys.updateMany({}, {
  $set: {
    company: 'Philips Lighting Poland Sp. z o.o.',
    employer: 'Jestem pracownikiem:',
    superior: 'Mój przełożony to:',
    showDivision: true,
    lang: {}
  }
});

db.delayreasons.updateMany({}, {$set: {requireComponent: false}});
