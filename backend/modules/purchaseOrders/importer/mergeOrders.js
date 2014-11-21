// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function mergeOrders(fromOrder, toOrder)
{
  var toItems = {};

  toOrder.items.forEach(function(toItem)
  {
    toItems[toItem._id] = toItem;
  });

  fromOrder.items.forEach(function(fromItem)
  {
    var toItem = toItems[fromItem._id];

    if (!toItem)
    {
      return;
    }

    var schedule = {};

    fromItem.schedule.forEach(function(fromSchedule)
    {
      schedule[fromSchedule.date.getTime()] = fromSchedule.qty;
    });

    toItem.schedule.forEach(function(toSchedule)
    {
      schedule[toSchedule.date.getTime()] = toSchedule.qty;
    });

    toItem.schedule = [];

    Object.keys(schedule).forEach(function(time)
    {
      toItem.schedule.push({
        date: new Date(+time),
        qty: schedule[time]
      });
    });

    toItem.schedule.sort(function(a, b)
    {
      return a.date - b.date;
    });
  });
};
