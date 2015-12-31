// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function editProdShift(app, prodShiftsModule, user, userInfo, prodShiftId, data, done)
{
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  var productionModule = app[prodShiftsModule.config.productionId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

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

      var logEntry = ProdLogEntry.editShift(prodShift, userInfo, data);

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

      var next = this.next();

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
