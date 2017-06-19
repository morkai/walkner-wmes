// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const later = require('later');

module.exports = function setUpDurationRecalculator(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const Suggestion = mongoose.model('Suggestion');
  let inProgress = false;

  app.broker.subscribe('app.started', recalcDurations).setLimit(1);

  later.setInterval(recalcDurations, later.parse.text('at 00:01 am'));

  module.recalcDurations = recalcDurations;

  function recalcDurations(all)
  {
    if (inProgress)
    {
      return;
    }

    const startedAt = new Date();

    module.debug('[durationRecalculator] Started...');

    inProgress = true;

    const conditions = {
      status: {
        $in: ['new', 'accepted', 'todo', 'inProgress', 'paused']
      }
    };
    const fields = {
      rid: 1,
      status: 1,
      date: 1,
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

    const stream = Suggestion.find(conditions, fields).lean().cursor();

    stream.on('error', function(err)
    {
      inProgress = false;

      module.error('[durationRecalculator] Failed to recalc suggestions: %s', err.message);
    });

    stream.on('data', function(doc)
    {
      recalcNext(doc, startedAt);
    });

    stream.on('end', function()
    {
      inProgress = false;

      module.debug('[durationRecalculator] Done in %d ms.', Date.now() - startedAt);
    });
  }

  function recalcNext(doc, startedAt)
  {
    const newKaizenDuration = Suggestion.recalcKaizenDuration(doc, startedAt);
    const newFinishDuration = Suggestion.recalcFinishDuration(doc, startedAt);
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

    Suggestion.update({_id: doc._id}, {$set: changes}, function(err)
    {
      if (err)
      {
        module.error('[durationRecalculator] Failed to recalc [%s]: %s', doc.rid, err.message);
      }
    });
  }
};
