// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var later = require('later');

module.exports = function setUpDurationRecalculator(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const D8Entry = mongoose.model('D8Entry');

  let inProgress = false;

  app.broker.subscribe('app.started', recalcDurations).setLimit(1);

  later.setInterval(recalcDurations, later.parse.text('at 00:02 am'));

  module.recalcDurations = recalcDurations;

  function recalcDurations(all)
  {
    if (inProgress)
    {
      return;
    }

    const startedAt = new Date();

    module.debug("[durationRecalculator] Started...");

    inProgress = true;

    const conditions = {
      status: 'open'
    };
    const fields = {
      rid: 1,
      d8OpenDate: 1,
      createdAt: 1,
      'strips.date': 1,
      duration: 1
    };

    if (all === true)
    {
      delete conditions.status;
    }

    const stream = D8Entry.find(conditions, fields).lean().cursor();

    stream.on('error', function(err)
    {
      inProgress = false;

      module.error("[durationRecalculator] Failed to recalc: %s", err.message);
    });

    stream.on('data', function(doc)
    {
      recalcNext(doc, startedAt);
    });

    stream.on('end', function()
    {
      inProgress = false;

      module.debug("[durationRecalculator] Done in %d ms.", Date.now() - startedAt);
    });
  }

  function recalcNext(doc, startedAt)
  {
    const newDuration = D8Entry.recalcDuration(doc, startedAt);

    if (newDuration === doc.duration)
    {
      return;
    }

    D8Entry.update({_id: doc._id}, {$set: {duration: newDuration}}, function(err)
    {
      if (err)
      {
        module.error("[durationRecalculator] Failed to recalc [%s]: %s", doc.rid, err.message);
      }
    });
  }
};
