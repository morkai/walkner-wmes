// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');

module.exports = function validateOverlappingDowntimes(app, pdModule, prodDowntime, changes, done)
{
  var express = app[pdModule.config.expressId];
  var mongoose = app[pdModule.config.mongooseId];
  var ProdDowntime = mongoose.model('ProdDowntime');

  if (!changes.startedAt && !changes.finishedAt)
  {
    return done(null);
  }

  var conditions = {prodShift: prodDowntime.prodShift};
  var fields = {startedAt: 1, finishedAt: 1};

  ProdDowntime.find(conditions, fields).lean().exec(function(err, prodDowntimes)
  {
    if (err)
    {
      return done(err);
    }

    var startedAt = changes.startedAt || prodDowntime.startedAt;
    var finishedAt = changes.finishedAt || prodDowntime.finishedAt;

    for (var i = 0, l = prodDowntimes.length; i < l; ++i)
    {
      var pd = prodDowntimes[i];

      if (pd._id === prodDowntime._id || startedAt >= pd.finishedAt || finishedAt <= pd.startedAt)
      {
        continue;
      }

      var pdStartedAt = moment(pd.startedAt).milliseconds(0).valueOf();
      var pdFinishedAt = moment(pd.finishedAt).milliseconds(0).valueOf();
      var newStartedAt = moment(startedAt).milliseconds(0).valueOf();
      var newFinishedAt = moment(finishedAt).milliseconds(0).valueOf();

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
