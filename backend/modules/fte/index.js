// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const setUpCache = require('./cache');
const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const editFteMasterEntry = require('./editFteMasterEntry');
const editFteLeaderEntry = require('./editFteLeaderEntry');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  subdivisionsId: 'subdivisions',
  settingsId: 'settings'
};

exports.start = function startFteModule(app, module)
{
  let shiftChangeTimer = null;

  module.getCurrentShift = getCurrentShift;

  module.currentShift = getCurrentShift();

  module.editFteMasterEntry = editFteMasterEntry.bind(null, app, module);
  module.editFteLeaderEntry = editFteLeaderEntry.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpCache.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.subdivisionsId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId,
      module.config.divisionsId,
      module.config.subdivisionsId,
      module.config.settingsId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.broker.subscribe('app.started', checkShiftChange);

  function checkShiftChange()
  {
    if (shiftChangeTimer)
    {
      clearTimeout(shiftChangeTimer);
      shiftChangeTimer = null;
    }

    const realCurrentShift = getCurrentShift();

    if (realCurrentShift.date > module.currentShift.date)
    {
      return changeShift();
    }

    const nextShiftTime = getNextShiftTime();
    const currentTime = Date.now();
    const timeDiff = nextShiftTime - currentTime;
    const delay = timeDiff > 300000 ? 300000 : timeDiff;

    shiftChangeTimer = setTimeout(checkShiftChange, delay);
  }

  function changeShift()
  {
    module.currentShift = getCurrentShift();

    module.debug('Changed to shift %d...', module.currentShift.no);

    app.broker.publish('shiftChanged', module.currentShift);

    checkShiftChange();
  }

  function getCurrentShift()
  {
    const date = moment().startOf('hour');
    const hours = date.hours();
    let no = 3;

    if (hours >= 6 && hours < 14)
    {
      no = 1;
      date.hours(6);
    }
    else if (hours >= 14 && hours < 22)
    {
      no = 2;
      date.hours(14);
    }
    else
    {
      if (hours < 6)
      {
        date.subtract(1, 'days');
      }

      date.hours(22);
    }

    return {
      date: date.toDate(),
      no: no
    };
  }

  function getNextShiftTime()
  {
    const nextShiftMoment = moment(module.currentShift.date.getTime());
    const currentShiftNo = module.currentShift.no;

    if (currentShiftNo === 1)
    {
      nextShiftMoment.hours(14);
    }
    else if (currentShiftNo === 2)
    {
      nextShiftMoment.hours(22);
    }
    else
    {
      nextShiftMoment.add(1, 'days').hours(6);
    }

    return nextShiftMoment.valueOf();
  }
};
