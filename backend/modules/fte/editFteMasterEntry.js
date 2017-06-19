// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function editFteMasterEntry(app, fteModule, user, userInfo, fteMasterEntryId, data, done)
{
  const orgUnits = app[fteModule.config.orgUnitsId];
  const mongoose = app[fteModule.config.mongooseId];
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');
  const FteMasterEntry = mongoose.model('FteMasterEntry');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getFteMasterEntryStep()
    {
      fteModule.getCachedEntry('master', fteMasterEntryId, this.parallel());

      if (!isChangeRequest)
      {
        this.releaseLock = fteModule.acquireLock(fteMasterEntryId, this.parallel());
      }
    },
    function updateOrCreateChangeRequestStep(err, fteMasterEntry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!fteMasterEntry)
      {
        return this.skip(null, 404);
      }

      if (isChangeRequest)
      {
        const subdivision = orgUnits.getByTypeAndId('subdivision', fteMasterEntry.subdivision);

        if (!subdivision)
        {
          return this.skip(new Error('INVALID_SUBDIVISION'), 400);
        }

        data.division = subdivision.division;
        data.subdivision = fteMasterEntry.subdivision.toString();
        data.prodLine = null;
        data.date = fteMasterEntry.date;

        ProdChangeRequest.create('edit', 'fteMaster', fteMasterEntry._id, userInfo, data, this.next());
      }
      else
      {
        fteMasterEntry = FteMasterEntry.hydrate(fteMasterEntry);
        fteMasterEntry.applyChangeRequest(data.changes, userInfo);
        fteMasterEntry.calcTotals();
        fteMasterEntry.save(this.next());
      }
    },
    function handleSaveStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!isChangeRequest)
      {
        fteModule.cleanCachedEntry(fteMasterEntryId);
      }
    },
    function finalizeStep(err, statusCode)
    {
      if (this.releaseLock)
      {
        this.releaseLock();
        this.releaseLock = null;

        app.broker.publish('fte.master.updated.' + fteMasterEntryId, {
          type: 'edit',
          changes: _.map(data.changes, function(change)
          {
            return {
              taskIndex: change.taskIndex,
              functionIndex: change.functionIndex,
              companyIndex: change.companyIndex,
              newCount: change.newValue
            };
          })
        });
      }

      setImmediate(done, err, statusCode);
    }
  );
};
