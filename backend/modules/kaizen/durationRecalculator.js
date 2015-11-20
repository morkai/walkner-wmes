// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var later = require('later');

module.exports = function setUpDurationRecalculator(app, module)
{
  var mongoose = app[module.config.mongooseId];
  var KaizenOrder = mongoose.model('KaizenOrder');
  var inProgress = null;

  app.broker.subscribe('app.started', recalcDurations).setLimit(1);

  later.setInterval(recalcDurations, later.parse.text('at 00:02 am'));

  module.recalcDurations = recalcDurations;

  function recalcDurations(all)
  {
    if (inProgress !== null)
    {
      return;
    }

    inProgress = [];

    var conditions = {
      status: {
        $in: ['new', 'accepted', 'todo', 'inProgress', 'paused']
      }
    };
    var fields = {
      changes: 0
    };

    if (all === true)
    {
      delete conditions.status;
    }

    KaizenOrder.find(conditions, fields).exec(function(err, suggestions)
    {
      if (err)
      {
        inProgress = null;

        return module.error("[durationRecalculator] Failed to find orders: %s", err.message);
      }

      inProgress = suggestions;

      recalcNext();
    });
  }

  function recalcNext()
  {
    var kaizenOrder = inProgress.shift();

    if (!kaizenOrder)
    {
      inProgress = null;

      return;
    }

    kaizenOrder.recalcKaizenDuration();
    kaizenOrder.recalcFinishDuration();
    kaizenOrder.save(function(err)
    {
      if (err)
      {
        module.error("[durationRecalculator] Failed to recalc [%s]: %s", kaizenOrder.rid, err.message);
      }

      setImmediate(recalcNext);
    });
  }
};
