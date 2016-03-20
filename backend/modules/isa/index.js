// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var setUpLineState = require('./lineState');
var setUpRoutes = require('./routes');
var setUpIsaShiftPersonnel = require('./shiftPersonnel');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  orgUnitsId: 'orgUnits',
  fteId: 'fte'
};

exports.start = function startIsaModule(app, module)
{
  var config = module.config;

  module.disabled = fs.existsSync(app.pathTo('..', 'isa-enabled')) ? null : {};

  app.broker.subscribe('app.started', checkModuleAvailability).setLimit(1);

  app.onModuleReady(
    [
      config.mongooseId,
      config.orgUnitsId,
      config.userId
    ],
    setUpLineState.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.fteId
    ],
    setUpIsaShiftPersonnel.bind(null, app, module)
  );

  function checkModuleAvailability()
  {
    fs.access(app.pathTo('..', 'isa-enabled'), function(err)
    {
      if (err)
      {
        return setTimeout(checkModuleAvailability, 30000);
      }

      _.forEach(module.disabled, function(unused, prodLineId)
      {
        app.broker.publish('isaLineStates.updated.' + prodLineId, module.getLineStateSync(prodLineId).toJSON());
      });

      module.disabled = null;
    });
  }
};
