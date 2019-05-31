/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.users.updateMany({prodFunction: {$exists: false}}, {$set: {prodFunction: null}});

db.kanbancomponents.find({}, {storageBin: 1}).forEach(component =>
{
  var entry = db.kanbanentries.findOne({nc12: component._id}, {_id: 1});

  if (!entry && !component.newStorageBin)
  {
    db.kanbancomponents.deleteOne({_id: component._id});
  }
});
