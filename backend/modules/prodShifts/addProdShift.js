// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function addProdShift(app, prodShiftsModule, user, userInfo, data, done)
{
  const mongoose = app[prodShiftsModule.config.mongooseId];
  const orgUnitsModule = app[prodShiftsModule.config.orgUnitsId];
  const productionModule = app[prodShiftsModule.config.productionId];
  const ProdShift = mongoose.model('ProdShift');
  const ProdLogEntry = mongoose.model('ProdLogEntry');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function validateInputStep()
    {
      data.shift = parseInt(data.shift, 10);

      const dateMoment = moment(data.date);

      orgUnitsModule.getAllForProdLine(data.prodLine, data);

      if (!dateMoment.isValid()
        || data.shift < 1
        || data.shift > 3
        || data.division === null)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      dateMoment.hours(data.shift === 1 ? 6 : data.shift === 2 ? 14 : 22);

      if (Date.now() <= dateMoment.clone().add(8, 'hours').valueOf())
      {
        return this.skip(new Error('SHIFT_NOT_ENDED'), 400);
      }

      data.date = dateMoment.toDate();
    },
    function findExistingProdShiftsStep()
    {
      ProdShift
        .find({date: data.date, prodLine: data.prodLine}, {_id: 1})
        .lean()
        .exec(this.next());
    },
    function handleExistingProdShiftsStep(err, prodShifts)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (prodShifts.length !== 0)
      {
        return this.skip(new Error('EXISTING'), 400);
      }
    },
    function createLogEntryOrChangeRequestStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const logEntry = ProdLogEntry.addShift(userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INPUT'), 400);
      }

      if (isChangeRequest)
      {
        ProdChangeRequest.create('add', 'shift', null, userInfo, data, this.next());
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

      productionModule.logEntryHandlers.addShift(
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
