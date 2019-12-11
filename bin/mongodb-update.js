/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

let todos = [];

function insertTodo(todo)
{
  if (todo)
  {
    todos.push(todo);
  }

  if (!todo || todos.length === 200)
  {
    db.cttodos.insertMany(todos);
    todos = [];
  }
}

['LM-41', 'LM-42'].forEach(line =>
{
  db.ctlines.deleteOne({_id: line});
  db.ctlines.insertOne({
    _id: line,
    active: false,
    type: 'luma2',
    stations: [{}, {}, {}, {}, {}, {}, {}],
    __v: 1
  });
  db.cttodos.deleteMany({line});
  db.ctpces.deleteMany({line});

  db.luma2events.find({type: {$in: ['pce-started', 'pce-finished']}, line}).sort({time: 1}).forEach(event =>
  {
    insertTodo({
      time: event.time,
      line,
      station: event.station,
      action: event.type,
      data: {
        orderNo: event.order,
        pce: event.pce
      }
    });
  });

  insertTodo();
});
