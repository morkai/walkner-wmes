// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function validateOverlappingDowntimes(app, pdModule, prodDowntime, changes, done)
{
  const express = app[pdModule.config.expressId];
  const mongoose = app[pdModule.config.mongooseId];
  const ProdDowntime = mongoose.model('ProdDowntime');

  if (!changes.startedAt && !changes.finishedAt)
  {
    return done(null);
  }

  const conditions = {prodShift: prodDowntime.prodShift};
  const fields = {startedAt: 1, finishedAt: 1};

  ProdDowntime.find(conditions, fields).lean().exec(function(err, prodDowntimes)
  {
    if (err)
    {
      return done(err);
    }

    let startedAt = changes.startedAt || prodDowntime.startedAt;
    let finishedAt = changes.finishedAt || prodDowntime.finishedAt;

    for (let i = 0, l = prodDowntimes.length; i < l; ++i)
    {
      const pd = prodDowntimes[i];

      if (pd._id === prodDowntime._id || startedAt >= pd.finishedAt || finishedAt <= pd.startedAt)
      {
        continue;
      }

      const pdStartedAt = moment(pd.startedAt).milliseconds(0).valueOf();
      const pdFinishedAt = moment(pd.finishedAt).milliseconds(0).valueOf();
      const newStartedAt = moment(startedAt).milliseconds(0).valueOf();
      const newFinishedAt = moment(finishedAt).milliseconds(0).valueOf();

      if (newStartedAt === pdFinishedAt)
      {
        startedAt = new Date(pd.finishedAt.getTime() + 1);
      }

      if (newFinishedAt === pdStartedAt)
      {
        finishedAt = new Date(pd.startedAt.getTime() - 1);
      }

      if (startedAt < pd.finishedAt && finishedAt > pd.startedAt)
      {
        return done(express.createHttpError('OVERLAPPING_DOWNTIMES', 400));
      }

      changes.startedAt = startedAt;
      changes.finishedAt = finishedAt;
    }

    return done(null);
  });
};
