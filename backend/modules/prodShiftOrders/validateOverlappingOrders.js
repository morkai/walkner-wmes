// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function validateOverlappingOrders(app, psoModule, prodShiftOrder, changes, done)
{
  const express = app[psoModule.config.expressId];
  const mongoose = app[psoModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (!changes.startedAt && !changes.finishedAt)
  {
    return done(null);
  }

  const conditions = {prodShift: prodShiftOrder.prodShift};
  const fields = {startedAt: 1, finishedAt: 1};

  ProdShiftOrder.find(conditions, fields).lean().exec(function(err, prodShiftOrders)
  {
    if (err)
    {
      return done(err);
    }

    let startedAt = changes.startedAt || prodShiftOrder.startedAt;
    let finishedAt = changes.finishedAt || prodShiftOrder.finishedAt;

    for (let i = 0, l = prodShiftOrders.length; i < l; ++i)
    {
      const pso = prodShiftOrders[i];

      if (pso._id === prodShiftOrder._id || startedAt >= pso.finishedAt || finishedAt <= pso.startedAt)
      {
        continue;
      }

      const psoStartedAt = moment(pso.startedAt).milliseconds(0).valueOf();
      const psoFinishedAt = moment(pso.finishedAt).milliseconds(0).valueOf();
      const newStartedAt = moment(startedAt).milliseconds(0).valueOf();
      const newFinishedAt = moment(finishedAt).milliseconds(0).valueOf();

      if (newStartedAt === psoFinishedAt)
      {
        startedAt = new Date(pso.finishedAt.getTime() + 1);
      }

      if (newFinishedAt === psoStartedAt)
      {
        finishedAt = new Date(pso.startedAt.getTime() - 1);
      }

      if (startedAt < pso.finishedAt && finishedAt > pso.startedAt)
      {
        return done(express.createHttpError('OVERLAPPING_ORDERS', 400));
      }

      changes.startedAt = startedAt;
      changes.finishedAt = finishedAt;
    }

    return done(null);
  });
};
