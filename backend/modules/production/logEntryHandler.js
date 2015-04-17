// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var deepEqual = require('deep-equal');
var step = require('h5.step');
var logEntryHandlers = require('./logEntryHandlers');

module.exports = function setUpProductionsLogEntryHandler(app, productionModule)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdLine = mongoose.model('ProdLine');
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var prodLines = app[productionModule.config.prodLinesId];

  var handlingLogEntries = false;
  var haveNewLogEntries = false;

  productionModule.handleLogEntries = handleLogEntries;

  app.broker.subscribe('production.logEntries.saved', handleLogEntries);

  app.broker.subscribe('app.started', handleLogEntries).setLimit(1);

  function handleLogEntries(done)
  {
    if (handlingLogEntries)
    {
      haveNewLogEntries = true;

      if (typeof done === 'function')
      {
        done(new Error('IN_PROGRESS'));
      }

      return;
    }

    handlingLogEntries = true;
    haveNewLogEntries = false;

    ProdLogEntry.find({todo: true}).sort({prodLine: 1, createdAt: 1}).exec(function(err, logEntries)
    {
      if (err)
      {
        handlingLogEntries = false;

        return productionModule.error("Failed to find log entries to handle: %s", err.stack);
      }

      var groupedLogEntries = groupLogEntriesByProdLine(logEntries);

      step(
        function handleProdLineLogEntriesStep()
        {
          var step = this;

          _.forEach(groupedLogEntries, function(logEntries, prodLineId)
          {
            var prodLine = prodLines.modelsById[prodLineId];

            if (!prodLine)
            {
              prodLine = new ProdLine({_id: prodLineId});
            }

            handleProdLineLogEntries(prodLine, logEntries, step.parallel());
          });
        },
        function finalizeLogEntryHandling(err)
        {
          handlingLogEntries = false;

          if (haveNewLogEntries)
          {
            setImmediate(handleLogEntries);
          }

          if (typeof done === 'function')
          {
            done(err);
          }
        }
      );
    });
  }

  function groupLogEntriesByProdLine(logEntries)
  {
    var groupedLogEntries = {};

    _.forEach(logEntries, function(logEntry)
    {
      if (!groupedLogEntries[logEntry.prodLine])
      {
        groupedLogEntries[logEntry.prodLine] = [];
      }

      groupedLogEntries[logEntry.prodLine].push(logEntry);
    });

    return groupedLogEntries;
  }

  function handleProdLineLogEntries(prodLine, logEntries, done)
  {
    var oldProdData = productionModule.recreating || prodLine.isNew ? null : {
      prodShift: null,
      prodShiftOrder: null,
      prodDowntime: null
    };
    var steps = [];
    var handledLogEntries = [];

    if (oldProdData !== null)
    {
      steps.push(
        function getOldProdDataStep()
        {
          productionModule.getProdData('shift', prodLine.get('prodShift'), this.parallel());
          productionModule.getProdData('order', prodLine.get('prodShiftOrder'), this.parallel());
          productionModule.getProdData('downtime', prodLine.get('prodDowntime'), this.parallel());
        },
        function setOldProdDataStep(err, prodShift, prodShiftOrder, prodDowntime)
        {
          oldProdData.prodShift = prodShift ? prodShift.toJSON() : null;
          oldProdData.prodShiftOrder = prodShiftOrder ? prodShiftOrder.toJSON() : null;
          oldProdData.prodDowntime = prodDowntime ? prodDowntime.toJSON() : null;
        }
      );
    }

    _.forEach(logEntries, function(logEntry)
    {
      steps.push(function handleNextLogEntryStep()
      {
        logEntryHandlers[logEntry.type](app, productionModule, prodLine, logEntry, this.next());
      });

      steps.push(function handleNextLogEntryResultStep(err)
      {
        if (err)
        {
          return this.skip();
        }

        handledLogEntries.push(logEntry);
      });
    });

    steps.push(function markHandledLogEntriesAsDoneStep()
    {
      if (!handledLogEntries.length)
      {
        return done(new Error('NO_ENTRIES_HANDLED'));
      }

      var handledLogEntryIds = handledLogEntries.map(function(logEntry) { return logEntry._id; });
      var cond = {_id: {$in: handledLogEntryIds}};
      var update = {$set: {todo: false}};

      ProdLogEntry.update(cond, update, {multi: true}, function(err)
      {
        if (err)
        {
          productionModule.error(
            "Failed to mark %d log entries for prod line [%s] as done: %s",
            handledLogEntries.length,
            prodLine.get('_id'),
            err.stack
          );
        }

        if (oldProdData !== null)
        {
          collectProdChanges(prodLine, handledLogEntries, oldProdData, function(changes)
          {
            app.broker.publish('production.synced.' + changes.prodLine, changes);
          });
        }

        handlingLogEntries = false;

        done();
      });
    });

    step(steps);
  }

  function collectProdChanges(prodLine, logEntries, oldProdData, done)
  {
    var types = {};

    _.forEach(logEntries, function(logEntry)
    {
      types[logEntry.type] = true;
    });

    var changes = {
      prodLine: prodLine.get('_id'),
      types: Object.keys(types)
    };

    if (logEntries.length === 1 && applySingleChange(changes, logEntries[0]))
    {
      return done(changes);
    }

    step(
      function getProdShiftDataStep()
      {
        productionModule.getProdData('shift', prodLine.get('prodShift'), this.next());
      },
      function applyProdShiftChangesStep(err, newProdShift)
      {
        applyChanges(changes, 'prodShift', oldProdData.prodShift, newProdShift);

        setImmediate(this.next());
      },
      function getProdShiftOrderDataStep()
      {
        productionModule.getProdData('order', prodLine.get('prodShiftOrder'), this.next());
      },
      function applyProdShiftOrderChangesStep(err, newProdShiftOrder)
      {
        applyChanges(changes, 'prodShiftOrder', oldProdData.prodShiftOrder, newProdShiftOrder);

        setImmediate(this.next());
      },
      function getProdShiftDataStep()
      {
        productionModule.getProdData('downtime', prodLine.get('prodDowntime'), this.next());
      },
      function applyProdShiftChangesStep(err, newProdDowntime)
      {
        applyChanges(changes, 'prodDowntime', oldProdData.prodDowntime, newProdDowntime);

        setImmediate(this.next());
      },
      function broadcastChangesStep()
      {
        done(changes);
      }
    );
  }

  function applySingleChange(changes, logEntry)
  {
    /*jshint -W015*/

    if (changes.types.indexOf(logEntry.type) === -1)
    {
      changes.types.push(logEntry.type);
    }

    switch (logEntry.type)
    {
      case 'changeMaster':
        return applyPersonnelChange(changes, 'master', logEntry.data);

      case 'changeLeader':
        return applyPersonnelChange(changes, 'leader', logEntry.data);

      case 'changeOperator':
        return applyPersonnelChange(changes, 'operator', logEntry.data);

      case 'changeQuantityDone':
        changes.prodShiftOrder = {quantityDone: logEntry.data.newValue};

        return true;

      case 'changeWorkerCount':
        changes.prodShiftOrder = {workerCount: logEntry.data.newValue};

        return true;

      case 'correctOrder':
        changes.prodShiftOrder = logEntry.data;

        return true;

      default:
        return false;
    }
  }

  function applyPersonnelChange(changes, type, data)
  {
    changes.prodShift = {};
    changes.prodShift[type] = data;
    changes.prodShiftOrder = {};
    changes.prodShiftOrder[type] = data;
    changes.prodDowntime = {};
    changes.prodDowntime[type] = data;

    return true;
  }

  function applyChanges(changes, property, oldModelData, newModel)
  {
    if (newModel === null)
    {
      changes[property] = oldModelData === null ? undefined : null;
    }
    else if (oldModelData === null || oldModelData._id !== newModel.get('_id'))
    {
      changes[property] = newModel.toJSON();
    }
    else
    {
      changes[property] = compareModels(oldModelData, newModel.toJSON());
    }
  }

  function compareModels(oldModelData, newModelData)
  {
    var changes = {};
    var changed = false;

    _.forEach(Object.keys(newModelData), function(property)
    {
      if (property.charAt(0) === '_' || property === 'orderData')
      {
        return;
      }

      if (!deepEqual(oldModelData[property], newModelData[property]))
      {
        changes[property] = newModelData[property];
        changed = true;

        if ((property === 'orderId' || property === 'operationNo') && newModelData.orderData)
        {
          changes.orderData = newModelData.orderData;
        }
      }
    });

    if (changed)
    {
      return changes;
    }
  }

  /**
   * @typedef {object} ProdShiftData
   * @property {string} _id
   * @property {string} prodLine
   * @property {Date} date
   * @property {number} shift
   * @property {string} state
   * @property {Array.<number>} quantitiesDone
   * @property {UserInfo} creator
   * @property {Date} createdAt
   * @property {UserInfo} master
   * @property {UserInfo} leader
   * @property {UserInfo} operator
   */

  /**
   * @typedef {object} ChangeShiftMessageData
   * @property {string|null} finishedProdShiftId
   * @property {ProdShiftData} startedProdShift
   */

  /**
   * @typedef {object} ChangePersonnelMessageData
   * @property {string|null} id
   * @property {string} label
   */

  /**
   * @typedef {object} ChangeQuantitiesDoneMessageData
   * @property {number} hour
   * @property {number} newValue
   */

  /**
   * @typedef {object} ChangeOrderMessageData
   * @property {string} _id
   * @property {string} prodShift
   * @property {string} prodLine
   * @property {Date} date
   * @property {number} shift
   * @property {boolean} mechOrder
   * @property {string} orderId
   * @property {string} operationNo
   * @property {object} orderData
   * @property {number} workerCount
   * @property {number} quantityDone
   * @property {UserInfo} creator
   * @property {string} startedAt
   */

  /**
   * @typedef {object} ChangeQuantityDoneMessageData
   * @property {number} newValue
   */

  /**
   * @typedef {object} ChangeWorkerCountMessageData
   * @property {number} newValue
   */

  /**
   * @typedef {object} EndWorkMessageData
   */

  /**
   * @typedef {object} StartDowntimeMessageData
   * @property {string} prodLine
   * @property {string} prodShift
   * @property {string} prodShiftOrder
   * @property {string} aor
   * @property {string} reason
   * @property {string} reasonComment
   * @property {string} status
   * @property {Date} startedAt
   * @property {UserInfo} master
   * @property {UserInfo} leader
   * @property {UserInfo} operator
   */

  /**
   * @typedef {object} FinishOrderMessageData
   * @property {string} _id
   * @property {Date} finishedAt
   */

  /**
   * @typedef {object} FinishDowntimeMessageData
   * @property {string} _id
   * @property {Date} finishedAt
   */
};
