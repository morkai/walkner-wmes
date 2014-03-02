'use strict';

var step = require('h5.step');

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
        .update({todo: false}, {todo: true}, {multi: true}, this.next());
    },
    function handleResetTodoResultStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to reset the todo flag :(");

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

      productionModule.handleLogEntries(this.next());
    },
    function finishRecreatingStep(err)
    {
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
};
