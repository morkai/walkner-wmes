// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const deepEqual = require('deep-equal');
const step = require('h5.step');
const logEntryHandlers = require('./logEntryHandlers');

module.exports = function setUpProductionsLogEntryHandler(app, productionModule)
{
  const MAX_ENTRIES_AT_ONCE = 25;

  const mongoose = app[productionModule.config.mongooseId];
  const ProdLine = mongoose.model('ProdLine');
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const prodLines = app[productionModule.config.prodLinesId];

  let handlingLogEntries = false;
  let haveNewLogEntries = false;

  productionModule.isHandlingLogEntries = function() { return handlingLogEntries; };
  productionModule.handleLogEntries = handleLogEntries;

  app.broker.subscribe('production.logEntries.saved', () => handleLogEntries());

  app.broker.subscribe('app.started', () => handleLogEntries()).setLimit(1);

  function handleLogEntries(done)
  {
    if (typeof done !== 'function')
    {
      done = function() {};
    }

    if (handlingLogEntries)
    {
      haveNewLogEntries = true;

      return done(new Error('IN_PROGRESS'));
    }

    handlingLogEntries = true;
    haveNewLogEntries = false;

    ProdLogEntry
      .find({todo: true})
      .sort({prodLine: 1, createdAt: 1})
      .limit(MAX_ENTRIES_AT_ONCE + 1)
      .exec(function(err, logEntries)
      {
        if (err)
        {
          handlingLogEntries = false;

          productionModule.error('Failed to find log entries to handle: %s', err.stack);

          return done(err);
        }

        if (logEntries.length > MAX_ENTRIES_AT_ONCE)
        {
          logEntries.pop();

          haveNewLogEntries = true;
        }

        const groupedLogEntries = groupLogEntriesByProdLine(logEntries);

        step(
          function handleProdLineLogEntriesStep()
          {
            const step = this;

            _.forEach(groupedLogEntries, function(logEntries, prodLineId)
            {
              let prodLine = prodLines.modelsById[prodLineId];

              if (!prodLine)
              {
                prodLine = new ProdLine({_id: prodLineId});
              }

              handleProdLineLogEntries(prodLine, logEntries, step.group());
            });
          },
          function finalizeLogEntryHandling(err)
          {
            handlingLogEntries = false;

            if (haveNewLogEntries)
            {
              setImmediate(handleLogEntries);
            }
            else
            {
              app.broker.publish('production.logEntries.handled', _.map(logEntries, '_id'));
            }

            done(err);
          }
        );
      });
  }

  function groupLogEntriesByProdLine(logEntries)
  {
    const groupedLogEntries = {};

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
    const oldProdData = productionModule.recreating || prodLine.isNew ? null : {
      prodShift: null,
      prodShiftOrder: null,
      prodDowntime: null
    };
    const steps = [];
    const handledLogEntries = [];

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
          if (err)
          {
            productionModule.error(`Failed to fetch old prod data: ${err.message}`);
          }

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
        if (!logEntryHandlers[logEntry.type])
        {
          return setImmediate(this.next(), new Error(`Unknown entry type: ${logEntry.type}`));
        }

        logEntryHandlers[logEntry.type](app, productionModule, prodLine, logEntry, this.next());
      });

      steps.push(function handleNextLogEntryResultStep(err)
      {
        if (err)
        {
          productionModule.error(`Failed to handle next log entry: ${err.message}\n${JSON.stringify(logEntry)}`);

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

      const handledLogEntryIds = handledLogEntries.map(logEntry => logEntry._id);
      const cond = {_id: {$in: handledLogEntryIds}};
      const update = {$set: {todo: false}};

      ProdLogEntry.updateMany(cond, update, err =>
      {
        if (err)
        {
          productionModule.error(
            'Failed to mark %d log entries for prod line [%s] as done: %s',
            handledLogEntries.length,
            prodLine.get('_id'),
            err.stack
          );
        }

        if (oldProdData !== null)
        {
          collectProdChanges(
            prodLine,
            handledLogEntries,
            oldProdData,
            changes => app.broker.publish(`production.synced.${changes.prodLine}`, changes)
          );
        }

        done();
      });
    });

    step(steps);
  }

  function collectProdChanges(prodLine, logEntries, oldProdData, done)
  {
    const types = {};

    _.forEach(logEntries, function(logEntry)
    {
      types[logEntry.type] = true;
    });

    const changes = {
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
        if (err)
        {
          productionModule.error(`Failed to fetch prod shift data: ${err.message}`);
        }

        applyChanges(changes, 'prodShift', oldProdData.prodShift, newProdShift || null);

        setImmediate(this.next());
      },
      function getProdShiftOrderDataStep()
      {
        productionModule.getProdData('order', prodLine.get('prodShiftOrder'), this.next());
      },
      function applyProdShiftOrderChangesStep(err, newProdShiftOrder)
      {
        if (err)
        {
          productionModule.error(`Failed to fetch prod shift order data: ${err.message}`);
        }

        applyChanges(changes, 'prodShiftOrder', oldProdData.prodShiftOrder, newProdShiftOrder || null);

        setImmediate(this.next());
      },
      function getProdShiftDataStep()
      {
        productionModule.getProdData('downtime', prodLine.get('prodDowntime'), this.next());
      },
      function applyProdShiftChangesStep(err, newProdDowntime)
      {
        if (err)
        {
          productionModule.error(`Failed to fetch prod downtime data: ${err.message}`);
        }

        applyChanges(changes, 'prodDowntime', oldProdData.prodDowntime, newProdDowntime || null);

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
    const changes = {};
    let changed = false;

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
