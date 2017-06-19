// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function mergeOrders(fromOrder, toOrder)
{
  var toItems = {};

  _.forEach(toOrder.items, function(toItem)
  {
    toItems[toItem._id] = toItem;
  });

  _.forEach(fromOrder.items, function(fromItem)
  {
    var toItem = toItems[fromItem._id];

    if (!toItem)
    {
      return;
    }

    var schedule = {};

    _.forEach(fromItem.schedule, function(fromSchedule)
    {
      schedule[fromSchedule.date.getTime()] = fromSchedule.qty;
    });

    _.forEach(toItem.schedule, function(toSchedule)
    {
      schedule[toSchedule.date.getTime()] = toSchedule.qty;
    });

    toItem.schedule = [];

    _.forEach(schedule, function(qty, time)
    {
      toItem.schedule.push({
        date: new Date(+time),
        qty: qty
      });
    });

    toItem.schedule.sort(function(a, b)
    {
      return a.date - b.date;
    });
  });
};
