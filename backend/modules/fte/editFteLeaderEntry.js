// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function editFteLeaderEntry(app, fteModule, user, userInfo, fteLeaderEntryId, data, done)
{
  var orgUnits = app[fteModule.config.orgUnitsId];
  var mongoose = app[fteModule.config.mongooseId];
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getFteLeaderEntryStep()
    {
      fteModule.getCachedEntry('leader', fteLeaderEntryId, this.parallel());

      if (!isChangeRequest)
      {
        this.releaseLock = fteModule.acquireLock(fteLeaderEntryId, this.parallel());
      }
    },
    function updateOrCreateChangeRequestStep(err, fteLeaderEntry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!fteLeaderEntry)
      {
        return this.skip(null, 404);
      }

      if (isChangeRequest)
      {
        var subdivision = orgUnits.getByTypeAndId('subdivision', fteLeaderEntry.subdivision);

        if (!subdivision)
        {
          return this.skip(new Error('INVALID_SUBDIVISION'), 400);
        }

        data.division = subdivision.division;
        data.subdivision = fteLeaderEntry.subdivision.toString();
        data.prodLine = null;
        data.date = fteLeaderEntry.date;

        ProdChangeRequest.create('edit', 'fteLeader', fteLeaderEntry._id, userInfo, data, this.next());
      }
      else
      {
        fteLeaderEntry = FteLeaderEntry.hydrate(fteLeaderEntry);
        fteLeaderEntry.applyChangeRequest(data.changes, userInfo);
        fteLeaderEntry.calcTotals();
        fteLeaderEntry.save(this.next());
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
        fteModule.cleanCachedEntry(fteLeaderEntryId);
      }
    },
    function finalizeStep(err, statusCode)
    {
      if (this.releaseLock)
      {
        this.releaseLock();
        this.releaseLock = null;

        app.broker.publish('fte.leader.updated.' + fteLeaderEntryId, {
          type: 'edit',
          changes: _.map(data.changes, function(change)
          {
            return {
              taskIndex: change.taskIndex,
              functionIndex: change.functionIndex,
              companyIndex: change.companyIndex,
              divisionIndex: change.divisionIndex,
              newCount: change.newValue
            };
          })
        });
      }

      setImmediate(done, err, statusCode);
    }
  );
};
