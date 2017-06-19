// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const later = require('later');
const moment = require('moment');

module.exports = function setUpDurationRecalculator(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const KaizenOrder = mongoose.model('KaizenOrder');
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

    const startedAt = Date.now();
    const currentDate = moment().startOf('day').toDate();

    module.debug('[durationRecalculator] Started...');

    inProgress = true;

    const conditions = {
      status: {
        $in: ['new', 'accepted', 'todo', 'inProgress', 'paused']
      }
    };
    const fields = {
      rid: 1,
      types: 1,
      status: 1,
      eventDate: 1,
      kaizenStartDate: 1,
      kaizenFinishDate: 1,
      finishedAt: 1,
      finishDuration: 1,
      kaizenDuration: 1
    };

    if (all === true)
    {
      delete conditions.status;
    }

    const stream = KaizenOrder.find(conditions, fields).lean().cursor();

    stream.on('error', function(err)
    {
      inProgress = false;

      module.error('[durationRecalculator] Failed to recalc orders: %s', err.message);
    });

    stream.on('data', function(doc)
    {
      recalcNext(doc, currentDate);
    });

    stream.on('end', function()
    {
      inProgress = false;

      module.debug('[durationRecalculator] Done in %d ms.', Date.now() - startedAt);
    });
  }

  function recalcNext(doc, currentDate)
  {
    const newKaizenDuration = KaizenOrder.recalcKaizenDuration(doc, currentDate);
    const newFinishDuration = KaizenOrder.recalcFinishDuration(doc, currentDate);
    let changed = false;
    const changes = {};

    if (newKaizenDuration !== doc.kaizenDuration)
    {
      changed = true;
      changes.kaizenDuration = newKaizenDuration;
    }

    if (newFinishDuration !== doc.finishDuration)
    {
      changed = true;
      changes.finishDuration = newFinishDuration;
    }

    if (!changed)
    {
      return;
    }

    KaizenOrder.update({_id: doc._id}, {$set: changes}, function(err)
    {
      if (err)
      {
        module.error('[durationRecalculator] Failed to recalc [%s]: %s', doc.rid, err.message);
      }
    });
  }
};
