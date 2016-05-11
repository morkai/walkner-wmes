// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setUpProdDowntimesAutoConfirmation(app, prodDowntimesModule)
{
  const settingsModule = app[prodDowntimesModule.config.settingsId];
  const mongoose = app[prodDowntimesModule.config.mongooseId];
  const orgUnits = app[prodDowntimesModule.config.orgUnitsId];
  const productionModule = app[prodDowntimesModule.config.productionId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdDowntime = mongoose.model('ProdDowntime');

  const MAX_BATCH_SIZE = 20;

  let settings = {};
  let timer = null;

  app.broker.subscribe('app.started', function()
  {
    settingsModule.findValues({_id: /^prodDowntimes/}, 'prodDowntimes.', function(err, result)
    {
      if (err)
      {
        prodDowntimesModule.error("Failed to find settings: %s", err.message);
      }
      else
      {
        settings = result;

        scheduleNextAutoConfirmation();
      }
    });
  }).setLimit(1);

  app.broker.subscribe('settings.updated.prodDowntimes.**', function(message)
  {
    settings[message._id.replace(/^prodDowntimes\./, '')] = message.value;
  });

  function scheduleNextAutoConfirmation()
  {
    if (timer !== null)
    {
      clearTimeout(timer);
    }

    timer = setTimeout(
      confirmOldProdDowntimes,
      moment().minutes(20).seconds(0).milliseconds(0).add(1, 'hours').diff()
    );
  }

  function confirmOldProdDowntimes()
  {
    if (timer !== null)
    {
      clearTimeout(timer);
    }

    const autoConfirmHours = settings.autoConfirmHours || 168;

    prodDowntimesModule.debug("Confirming downtimes older than %d hours!...", autoConfirmHours);

    step(
      function findOldDowntimesStep()
      {
        const conditions = {
          updatedAt: {$lte: moment().subtract(autoConfirmHours, 'hours').toDate()},
          status: {$in: ['undecided', 'rejected']}
        };
        const fields = {
          division: 1,
          subdivision: 1,
          mrpControllers: 1,
          prodFlow: 1,
          workCenter: 1,
          prodLine: 1,
          prodShift: 1,
          prodShiftOrder: 1,
          changes: {$slice: [0, 1]}
        };

        ProdDowntime
          .find(conditions, fields)
          .limit(MAX_BATCH_SIZE)
          .lean()
          .exec(this.next());
      },
      function corroborateStep(err, oldProdDowntimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        const count = this.count = oldProdDowntimes.length;

        if (count === 0)
        {
          return;
        }

        const now = new Date();
        const prodLogEntries = _.map(oldProdDowntimes, downtime => createCorroborateDowntimeEntry(downtime, now));
        const remainingIds = _.map(prodLogEntries, '_id');
        const handlingDone = _.once(this.parallel());
        const insertingDone = _.once(this.parallel());

        app.broker.subscribe('production.logEntries.handled', () => handlingDone())
          .setLimit(1)
          .setFilter(handledEntryIds => _.pullAll(remainingIds, handledEntryIds).length === 0);

        ProdLogEntry.collection.insert(prodLogEntries, function(err)
        {
          insertingDone(err);

          if (!err)
          {
            app.broker.publish('production.logEntries.saved');
          }
        });

        this.timer = setTimeout(
          function()
          {
            const err = new Error('timeout');

            handlingDone(err);
            insertingDone(err);
          },
          60000
        );
      },
      function finalizeStep(err)
      {
        if (this.timer)
        {
          clearTimeout(this.timer);
          this.timer = null;
        }
        
        if (err)
        {
          prodDowntimesModule.error("Failed to confirm old downtimes: %s", err.message);
        }
        else if (this.count > 0)
        {
          prodDowntimesModule.info("Confirmed %d downtimes older than %d hours!", this.count, autoConfirmHours);
        }

        if (this.count === MAX_BATCH_SIZE)
        {
          productionModule.clearStaleProdData();

          setImmediate(confirmOldProdDowntimes);
        }
        else
        {
          setImmediate(scheduleNextAutoConfirmation);
        }
      }
    );
  }

  function createCorroborateDowntimeEntry(prodDowntime, now)
  {
    const data = {
      _id: prodDowntime._id,
      status: 'confirmed',
      corroboratedAt: now,
      corroborator: {
        id: null,
        ip: '127.0.0.1',
        cname: 'LOCALHOST',
        label: 'System'
      }
    };
    const changes = prodDowntime.changes;

    if (Array.isArray(changes) && changes.length)
    {
      const initialData = changes[0].data;
      const originalReason = Array.isArray(initialData.reason) ? initialData.reason[1] : null;
      const initiatorsAor = getDefaultAorIdForSubdivisionId(prodDowntime.subdivision);

      if (originalReason && prodDowntime.reason !== originalReason)
      {
        data.reason = originalReason;
      }

      if (initiatorsAor && String(prodDowntime.aor) !== String(initiatorsAor))
      {
        data.aor = initiatorsAor;
      }
    }

    return {
      _id: ProdLogEntry.generateId(now, prodDowntime.prodShift),
      type: 'corroborateDowntime',
      data: data,
      division: prodDowntime.division,
      subdivision: prodDowntime.subdivision,
      mrpControllers: prodDowntime.mrpControllers,
      prodFlow: prodDowntime.prodFlow,
      workCenter: prodDowntime.workCenter,
      prodLine: prodDowntime.prodLine,
      prodShift: prodDowntime.prodShift,
      prodShiftOrder: prodDowntime.prodShiftOrder,
      creator: data.corroborator,
      createdAt: now,
      savedAt: now,
      todo: true
    };
  }

  function getDefaultAorIdForSubdivisionId(subdivisionId)
  {
    const subdivision = orgUnits.getByTypeAndId('subdivision', subdivisionId);

    return subdivision && subdivision.aor ? subdivision.aor : null;
  }
};
