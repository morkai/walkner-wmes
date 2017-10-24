// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function editFteMasterEntry(app, fteModule, user, userInfo, entryId, data, done)
{
  const orgUnits = app[fteModule.config.orgUnitsId];
  const mongoose = app[fteModule.config.mongooseId];
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');
  const FteMasterEntry = mongoose.model('FteMasterEntry');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getFteMasterEntryStep()
    {
      fteModule.getCachedEntry('master', entryId, this.parallel());

      if (!isChangeRequest)
      {
        this.releaseLock = fteModule.acquireLock(entryId, this.parallel());
      }
    },
    function updateOrCreateChangeRequestStep(err, entry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!entry)
      {
        return this.skip(null, 404);
      }

      if (isChangeRequest)
      {
        const subdivision = orgUnits.getByTypeAndId('subdivision', entry.subdivision);

        if (!subdivision)
        {
          return this.skip(new Error('INVALID_SUBDIVISION'), 400);
        }

        data.division = subdivision.division;
        data.subdivision = entry.subdivision.toString();
        data.prodLine = null;
        data.date = entry.date;

        ProdChangeRequest.create('edit', 'fteMaster', entry._id, userInfo, data, this.next());
      }
      else
      {
        entry = FteMasterEntry.hydrate(entry);
        entry.applyChangeRequest(data.changes, userInfo);
        entry.calcTotals();
        entry.save(this.next());
      }
    },
    function handleSaveStep(err, entry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!isChangeRequest)
      {
        fteModule.cleanCachedEntry(entryId);

        this.message = {
          type: 'edit',
          socketId: null,
          tasks: data.changes.map(change =>
          {
            return {
              index: change.taskIndex,
              data: entry.tasks[change.taskIndex]
            };
          }),
          data: _.pick(entry, [
            'updatedAt',
            'updater',
            'companyTotals',
            'totalDemand',
            'total',
            'totalShortage'
          ])
        };
      }
    },
    function finalizeStep(err, statusCode)
    {
      if (this.releaseLock)
      {
        if (!err && !statusCode)
        {
          app.broker.publish(`fte.master.updated.${entryId}`, this.message);
        }

        this.releaseLock();
      }

      setImmediate(done, err, statusCode);
    }
  );
};
