// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function editProdDowntime(app, pdModule, user, userInfo, prodDowntimeId, data, done)
{
  var mongoose = app[pdModule.config.mongooseId];
  var orgUnitsModule = app[pdModule.config.orgUnitsId];
  var productionModule = app[pdModule.config.productionId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var isChangeRequest = !user.super && !_.includes(user.privileges, 'PROD_DATA:CHANGES:MANAGE');

  step(
    function getProdDataStep()
    {
      productionModule.getProdData('downtime', prodDowntimeId, this.next());
    },
    function createLogEntryOrChangeRequestStep(err, prodDowntime)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!prodDowntime)
      {
        return this.skip(null, 404);
      }

      if (!prodDowntime.isEditable())
      {
        return this.skip(new Error('NOT_EDITABLE'), 400);
      }

      var logEntry = ProdLogEntry.editDowntime(prodDowntime, userInfo, data);

      if (!logEntry)
      {
        return this.skip(new Error('INVALID_CHANGES'), 400);
      }

      var next = this.next();

      pdModule.validateOverlappingDowntimes(prodDowntime, logEntry.data, function(err)
      {
        if (err)
        {
          return next(err, null);
        }

        if (isChangeRequest)
        {
          ProdChangeRequest.create('edit', 'downtime', prodDowntime._id, userInfo, data, next);
        }
        else
        {
          logEntry.save(next);
        }
      });
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

      productionModule.logEntryHandlers.editDowntime(
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
