// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var moment = require('moment');

module.exports = function(app, productionModule, done)
{
  if (productionModule.recreating)
  {
    return done(new Error('IN_PROGRESS'));
  }

  productionModule.recreating = true;

  var mongoose = app[productionModule.config.mongooseId];
  var startTime = Date.now();

  productionModule.info("Recreating started...");

  step(
    function removeCurrentDataStep()
    {
      productionModule.info("Removing current data...");

      mongoose.model('ProdShift').remove(null, this.parallel());
      mongoose.model('ProdShiftOrder').remove(null, this.parallel());
      mongoose.model('ProdDowntime').remove(null, this.parallel());
    },
    function handleRemoveCurrentDataResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to remove the current data :(");

        return this.skip(err);
      }
    },
    function resetTodoStep()
    {
      productionModule.info("Resetting the todo flag...");

      mongoose.model('ProdLogEntry')
        .update({todo: true}, {todo: false}, {multi: true}, this.next());
    },
    function handleResetTodoResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to reset the todo flag :(");

        return this.skip(err);
      }
    },
    function resetIdCountersStep()
    {
      productionModule.info("Resetting ID counters...");

      mongoose.model('IdentityCounter')
        .update({model: 'ProdDowntime', field: 'rid'}, {$set: {count: 0}}, this.next());
    },
    function handleResetIdCountersResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to reset the ID counters :(");

        return this.skip(err);
      }
    },
    function countPressWorksheetsStep()
    {
      productionModule.info("Counting the press worksheets...");

      mongoose.model('PressWorksheet').count().exec(this.next());
    },
    function recreatePressWorksheetDataStep(err, allPressWorksheetCount)
    {
      if (err)
      {
        productionModule.error("Failed to count the press worksheets :(");

        return this.skip(err);
      }

      productionModule.info("Recreating the press worksheets...");

      var donePressWorksheetCount = 0;
      var stream = mongoose.model('PressWorksheet').find().stream();
      var nextStep = this.next();

      stream.on('error', nextStep);

      stream.on('data', function(pressWorksheet)
      {
        pressWorksheet.createOrdersAndDowntimes(function(err)
        {
          if (err)
          {
            productionModule.error(
              "Failed to recreate the press worksheet [%s]: %s", pressWorksheet._id, err.stack
            );
          }

          ++donePressWorksheetCount;

          if (donePressWorksheetCount === allPressWorksheetCount)
          {
            setImmediate(nextStep);
          }
        });
      });
    },
    function handleRecreatePressWorksheetDataResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to recreate the press worksheets :(");

        return this.skip(err);
      }
    },
    function recreateProdLogEntryDataStep()
    {
      productionModule.info("Recreating the prod log entries...");

      var next = this.next();

      mongoose.model('ProdLogEntry').aggregate(
        {$group: {_id: null, max: {$max: '$createdAt'}, min: {$min: '$createdAt'}}},
        function(err, results)
        {
          if (err)
          {
            return next(err);
          }

          if (!results || !results.length)
          {
            return next();
          }

          var fromMoment = moment(results[0].min).weekday(0);
          var maxTime = moment(results[0].max).weekday(0).add(1, 'weeks').valueOf();

          productionModule.info(
            "Recreating the prod log entries from %s to %s...",
            app.formatDate(fromMoment.toDate()),
            app.formatDate(maxTime)
          );

          var steps = [];

          while (fromMoment.valueOf() < maxTime)
          {
            var from = new Date(fromMoment.valueOf());
            var to = new Date(fromMoment.add(1, 'weeks').valueOf());

            steps.push(createHandleWeekOfLogEntriesStep(from, to));
          }

          steps.push(next);

          step(steps);
        });
    },
    function handleRecreateProdLogEntryDataResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to recreate the prod log entries :(");

        return this.skip(err);
      }
    },
    function recountPlannedQuantitiesStep()
    {
      productionModule.info("Recounting the planned quantities...");

      productionModule.clearProdData();

      var next = this.next();

      mongoose.model('HourlyPlan')
        .find()
        .sort({date: 1, division: 1})
        .exec(function(err, hourlyPlans)
        {
          if (err)
          {
            return next(err);
          }

          step(
            function()
            {
              for (var i = 0, l = hourlyPlans.length; i < l; ++i)
              {
                hourlyPlans[i].recountPlannedQuantities(this.parallel());
              }
            },
            next
          );
        });
    },
    function finishRecreatingStep(err)
    {
      productionModule.clearProdData();

      if (err)
      {
        productionModule.error("Failed to recreate the production data: %s", err.stack);
      }
      else
      {
        productionModule.info(
          "Finished recreating the production data in %ds!", (Date.now() - startTime) / 1000
        );
      }

      productionModule.recreating = false;

      if (typeof done === 'function')
      {
        done(err);
      }
    }
  );

  function createHandleWeekOfLogEntriesStep(from, to)
  {
    return function handleWeekOfLogEntriesStep()
    {
      var week = app.formatDate(from);

      productionModule.info("Recreating week %s...", week);

      var next = this.next();
      var conditions = {createdAt: {$gte: from, $lt: to}};
      var update = {$set: {todo: true}};

      mongoose.model('ProdLogEntry').update(conditions, update, {multi: true}, function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to reset todo flag of log entries for week %s: %s", week, err.stack
          );

          return next(err);
        }

        productionModule.handleLogEntries(function(err)
        {
          productionModule.clearProdData();

          if (err)
          {
            productionModule.error(
              "Failed to handle log entries for week %s: %s", week, err.stack
            );
          }

          return next(err);
        });
      });
    };
  }
};
