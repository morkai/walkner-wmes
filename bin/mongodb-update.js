/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.kaizenbehaviours.find({lang: {$exists: false}}).forEach(kb =>
{
  kb.lang = {
    pl: {
      name: kb.name,
      description: kb.description
    },
    en: {
      name: kb.name,
      description: kb.description
    }
  };

  db.kaizenbehaviours.updateOne({_id: kb._id}, {$set: {lang: kb.lang}, $unset: {name: 1, description: 1}});
});

db.users.updateMany({apiKey: {$exists: false}}, {$set: {apiKey: ''}});
