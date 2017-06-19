// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function editProdShift(app, prodShiftsModule, user, userInfo, prodShiftId, data, done)
{
  const mongoose = app[prodShiftsModule.config.mongooseId];
  const orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  const productionModule = app[prodShiftsModule.config.productionId];
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getProdDataStep()
    {
      productionModule.getProdData('shift', prodShiftId, this.next());
    },
    function createLogEntryOrChangeRequestStep(err, prodShift)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodShift)
      {
        return this.skip(null, 404);
      }

      if (!prodShift.isEditable())
      {
        return this.skip(new Error('NOT_EDITABLE'), 400);
      }

      const logEntry = ProdLogEntry.editShift(prodShift, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INVALID_CHANGES'), 400);
      }

      if (isChangeRequest)
      {
        ProdChangeRequest.create('edit', 'shift', prodShift._id, userInfo, data, this.next());
      }
      else
      {
        logEntry.save(this.next());
      }
    },
    function handleSaveStep(err, model)
    {
      if (err)
      {
        return this.skip(err);
      }

      const next = this.next();

      if (isChangeRequest)
      {
        return setImmediate(next, null, 204, null);
      }

      productionModule.logEntryHandlers.editShift(
        app,
        productionModule,
        orgUnitsModule.getByTypeAndId('prodLine', model.prodLine),
        model,
        function(err) { return next(err, null, model); }
      );
    },
    done
  );
};
