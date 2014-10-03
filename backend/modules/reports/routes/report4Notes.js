// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var helpers = require('./helpers');

module.exports = function report4NotesRoute(app, reportsModule, req, res, next)
{
  var mongoose = app[reportsModule.config.mongooseId];

  var userIds = [];
  var conditions = {
    date: {
      $gte: new Date(helpers.getTime(req.query.from)),
      $lt: new Date(helpers.getTime(req.query.to))
    },
    orders: {
      $elemMatch: {
        notes: {$ne: ''}
      }
    }
  };
  var fields = {
    rid: 1,
    date: 1,
    shift: 1,
    'orders.prodLine': 1,
    'orders.nc12': 1,
    'orders.name': 1,
    'orders.operationNo': 1,
    'orders.operationName': 1,
    'orders.downtimes': 1,
    'orders.losses': 1,
    'orders.notes': 1,
    'orders.startedAt': 1,
    'orders.finishedAt': 1,
    'orders.quantityDone': 1,
    'orders.prodShiftOrder': 1
  };

  var mode = req.query.mode;

  if (mode === 'shift')
  {
    conditions.shift = parseInt(req.query.shift, 10);
    fields.operator = 1;
  }
  else
  {
    userIds = (req.query[req.query.mode] || '')
      .split(',')
      .filter(function(userId) { return (/^[a-zA-Z0-9]{24}$/).test(userId); });

    if (mode === 'masters')
    {
      conditions['master.id'] = {$in: userIds};
      fields.master = 1;
    }
    else
    {
      conditions['operators.id'] = {$in: userIds};
      fields.operators = 1;
    }
  }

  mongoose.model('PressWorksheet').find(conditions, fields).sort({date: -1}).lean().exec(function(err, pressWorksheets)
  {
    if (err)
    {
      return next(err);
    }

    var collection = [];

    for (var i = 0, l = pressWorksheets.length; i < l; ++i)
    {
      var pressWorksheet = pressWorksheets[i];
      var orders = pressWorksheet.orders;
      var user;

      if (mode === 'shift')
      {
        user = pressWorksheet.operator.label;
      }
      else if (mode === 'masters')
      {
        user = pressWorksheet.master.label;
      }
      else
      {
        user = getOperatorLabel(userIds, pressWorksheet.operators);
      }

      for (var ii = 0, ll = orders.length; ii < ll; ++ii)
      {
        var order = orders[ii];

        if (!order.notes)
        {
          continue;
        }

        order.pressWorksheet = {
          _id: pressWorksheet._id,
          rid: pressWorksheet.rid,
          user: user,
          date: new Date(pressWorksheet.date),
          shift: pressWorksheet.shift
        };

        if (order.operationName)
        {
          order.operationName = order.operationName.replace(/,/g, ', ').replace(/\.([^,.])/g, '.$1');
        }

        collection.push(order);
      }
    }

    res.json({
      totalCount: collection.length,
      collection: collection.sort(function(a, b)
      {
        var result = a.pressWorksheet.user.localeCompare(b.pressWorksheet.user);

        if (result !== 0)
        {
          return result;
        }

        return a.pressWorksheet.date - b.pressWorksheet.date;
      })
    });
  });
};

function getOperatorLabel(operatorIds, operators)
{
  return lodash.find(operators, function(operator) { return operatorIds.indexOf(operator.id) !== -1; }).label;
}
