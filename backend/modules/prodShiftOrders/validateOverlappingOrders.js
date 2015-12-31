// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var moment = require('moment');

module.exports = function validateOverlappingOrders(app, psoModule, prodShiftOrder, changes, done)
{
  var express = app[psoModule.config.expressId];
  var mongoose = app[psoModule.config.mongooseId];
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');

  if (!changes.startedAt && !changes.finishedAt)
  {
    return done(null);
  }

  var conditions = {prodShift: prodShiftOrder.prodShift};
  var fields = {startedAt: 1, finishedAt: 1};

  ProdShiftOrder.find(conditions, fields).lean().exec(function(err, prodShiftOrders)
  {
    if (err)
    {
      return done(err);
    }

    var startedAt = changes.startedAt || prodShiftOrder.startedAt;
    var finishedAt = changes.finishedAt || prodShiftOrder.finishedAt;

    for (var i = 0, l = prodShiftOrders.length; i < l; ++i)
    {
      var pso = prodShiftOrders[i];

      if (pso._id === prodShiftOrder._id || startedAt >= pso.finishedAt || finishedAt <= pso.startedAt)
      {
        continue;
      }

      var psoStartedAt = moment(pso.startedAt).milliseconds(0).valueOf();
      var psoFinishedAt = moment(pso.finishedAt).milliseconds(0).valueOf();
      var newStartedAt = moment(startedAt).milliseconds(0).valueOf();
      var newFinishedAt = moment(finishedAt).milliseconds(0).valueOf();

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
