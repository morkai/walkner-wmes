// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose'
};

exports.start = function startDailyMrpCountModule(app, module)
{
  app.broker.subscribe('orgUnits.rebuilt', onAppStarted).setLimit(1);

  app.broker.subscribe('shiftChanged', newShift => setTimeout(onShiftChanged, 1337, newShift));

  function onAppStarted()
  {
    const localMoment = moment();

    if (localMoment.hours() < 14)
    {
      localMoment.subtract(1, 'days');
    }

    localMoment.startOf('day');

    const utcMoment = moment.utc(localMoment.format('YYYY-MM-DD'), 'YYYY-MM-DD');

    recount(utcMoment.toDate());
  }

  function onShiftChanged(newShift)
  {
    const localMoment = moment(newShift.date).startOf('day');

    if (newShift.no === 1)
    {
      localMoment.subtract(1, 'days');
    }

    const utcMoment = moment.utc(localMoment.format('YYYY-MM-DD'), 'YYYY-MM-DD');

    recount(utcMoment.toDate());
  }

  function recount(date)
  {
    app[module.config.mongooseId].model('DailyMrpCount').recount(date, err =>
    {
      if (err)
      {
        module.error(`Failed to recount: ${err.message}`);
      }
      else
      {
        module.debug(`Recounted ${app.formatDate(date)}`);
      }
    });
  }
};
