/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.kanbancomponents.update({}, {$unset: {markerColor: 1}}, {multi: true});

db.settings.insert({
  "_id" : "kanban.rowColors",
  "__v" : 0,
  "updatedAt" : new ISODate("2018-08-29T19:38:49.155Z"),
  "updater" : {
    "id" : new ObjectId("52a33b8bfb955dac8a92261b"),
    "ip" : "127.0.0.1",
    "label" : "root"
  },
  "value" : {
    "A" : "yellow",
    "B" : "yellow",
    "C" : "orange",
    "D" : "orange",
    "E" : "green",
    "F" : "green",
    "G" : "violet",
    "H" : "violet",
    "I" : "pink",
    "J" : "pink",
    "K" : "lightblue",
    "L" : "lightblue",
    "M" : "grey",
    "N" : "grey"
  }
});
