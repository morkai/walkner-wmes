// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function setUpProdDowntimesAutoConfirmation(app, prodDowntimesModule)
{
  var settingsModule = app[prodDowntimesModule.config.settingsId];
  var mongoose = app[prodDowntimesModule.config.mongooseId];
  var orgUnits = app[prodDowntimesModule.config.orgUnitsId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdDowntime = mongoose.model('ProdDowntime');

  var MAX_BATCH_SIZE = 25;

  var settings = {};
  var timer = null;

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

    var delay = moment().minutes(20).seconds(0).milliseconds(0).add(1, 'hours').diff();

    timer = setTimeout(confirmOldProdDowntimes, delay);
  }

  function confirmOldProdDowntimes()
  {
    var autoConfirmHours = settings.autoConfirmHours || 168;

    step(
      function findOldDowntimesStep()
      {
        var conditions = {
          updatedAt: {$lte: moment().subtract(autoConfirmHours, 'hours').toDate()},
          status: {$in: ['undecided', 'rejected']}
        };
        var fields = {
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

        ProdDowntime.find(conditions, fields).limit(MAX_BATCH_SIZE).lean().exec(this.next());
      },
      function corroborateStep(err, oldProdDowntimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.count = oldProdDowntimes.length;

        if (this.count === 0)
        {
          return;
        }

        var now = new Date();
        var prodLogEntries = _.map(oldProdDowntimes, function(prodDowntime)
        {
          var data = {
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

          var changes = prodDowntime.changes;

          if (Array.isArray(changes) && changes.length)
          {
            var initialData = changes[0].data;
            var originalReason = Array.isArray(initialData.reason) ? initialData.reason[1] : null;
            var initiatorsAor = getDefaultAorIdForSubdivisionId(prodDowntime.subdivision);

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
        });

        this.prodLogEntryIds = _.pluck(prodLogEntries, '_id');

        ProdLogEntry.collection.insert(prodLogEntries, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          prodDowntimesModule.error("Failed to confirm old downtimes: %s", err.message);
        }
        else if (this.count > 0)
        {
          prodDowntimesModule.info("Confirmed %d downtimes older than %d hours!", this.count, autoConfirmHours);

          app.broker.publish('production.logEntries.saved');
        }

        if (this.count === MAX_BATCH_SIZE)
        {
          var prodLogEntryIds = this.prodLogEntryIds;
          this.prodLogEntryIds = null;

          app.broker.subscribe('production.logEntries.handled', confirmOldProdDowntimes)
            .setLimit(1)
            .setFilter(function(handledProdLogEntryIds)
            {
              return _.without.apply(_, prodLogEntryIds, handledProdLogEntryIds).length === 0;
            });
        }
        else
        {
          setImmediate(scheduleNextAutoConfirmation);
        }
      }
    );
  }

  function getDefaultAorIdForSubdivisionId(subdivisionId)
  {
    var subdivision = orgUnits.getByTypeAndId('subdivision', subdivisionId);

    return subdivision && subdivision.aor ? subdivision.aor : null;
  }
};
