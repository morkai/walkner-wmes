// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function setUpAutoDowntimeCache(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const Setting = mongoose.model('Setting');

  const dateToLineToDowntimes = new Map();
  let lineAutoDowntimes = null;

  setInterval(clear, 3 * 24 * 3600 * 1000);

  function load(date, done)
  {
    Setting.findOne({_id: 'production.lineAutoDowntimes'}, {value: 1}).lean().exec((err, setting) =>
    {
      if (err)
      {
        return done(err);
      }

      if (!setting)
      {
        return done(new Error('No [production.lineAutoDowntimes] setting!'));
      }

      lineAutoDowntimes = setting.value;

      get(date, done);
    });
  }

  function clear()
  {
    dateToLineToDowntimes.clear();

    lineAutoDowntimes = null;
  }

  function get(date, done)
  {
    if (dateToLineToDowntimes.has(date))
    {
      return setImmediate(done, null, dateToLineToDowntimes.get(date));
    }

    if (!lineAutoDowntimes)
    {
      return load(date, done);
    }

    const startTime = moment.utc(date, 'YYYY-MM-DD').valueOf();
    const lineToDowntimes = new Map();

    lineAutoDowntimes.forEach(group =>
    {
      let first = null;
      let current = null;

      group.downtimes.forEach(downtime =>
      {
        if (downtime.when !== 'time')
        {
          return;
        }

        downtime.time.forEach(time =>
        {
          if (!time.d)
          {
            return;
          }

          const item = {
            first: first,
            next: null,
            reason: downtime.reason,
            startTime: moment.utc(startTime)
              .add(time.h < 6 ? 1 : 0, 'days')
              .hours(time.h)
              .minutes(time.m)
              .valueOf(),
            duration: time.d * 60 * 1000
          };

          if (first === null)
          {
            first = item;
          }
          else
          {
            current.next = item;
          }

          current = item;
        });
      });

      group.lines.forEach(line =>
      {
        lineToDowntimes.set(line, first);
      });
    });

    dateToLineToDowntimes.set(date, lineToDowntimes);

    return setImmediate(done, null, lineToDowntimes);
  }

  return {clear, get};
};
