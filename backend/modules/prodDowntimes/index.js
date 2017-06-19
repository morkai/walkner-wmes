// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var validateOverlappingDowntimes = require('./validateOverlappingDowntimes');
var addProdDowntime = require('./addProdDowntime');
var editProdDowntime = require('./editProdDowntime');
var deleteProdDowntime = require('./deleteProdDowntime');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpAutoConfirmation = require('./autoConfirmation');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  productionId: 'production',
  aorsId: 'aors',
  downtimeReasonsId: 'downtimeReasons',
  orgUnitsId: 'orgUnits',
  settingsId: 'settings'
};

exports.start = function startProdDowntimesModule(app, module)
{
  module.validateOverlappingDowntimes = validateOverlappingDowntimes.bind(null, app, module);
  module.addProdDowntime = addProdDowntime.bind(null, app, module);
  module.editProdDowntime = editProdDowntime.bind(null, app, module);
  module.deleteProdDowntime = deleteProdDowntime.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.aorsId,
      module.config.downtimeReasonsId,
      module.config.orgUnitsId,
      module.config.productionId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.sioId,
      module.config.productionId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.settingsId,
      module.config.orgUnitsId,
      module.config.productionId
    ],
    setUpAutoConfirmation.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.productionId
    ],
    setUpConfirmedDowntimeEditWarning
  );

  function setUpConfirmedDowntimeEditWarning()
  {
    app.broker.subscribe('prodDowntimes.updated.*', checkConfirmedDowntimeEdit);
  }

  function checkConfirmedDowntimeEdit(partialProdDowntime)
  {
    if (!Array.isArray(partialProdDowntime.changes))
    {
      return;
    }

    var lastChange = partialProdDowntime.changes[partialProdDowntime.changes.length - 1];

    if (!lastChange || !lastChange.data || !lastChange.user || !lastChange.user.id)
    {
      return;
    }

    var data = lastChange.data;

    if (data.status && data.status[1] === 'confirmed')
    {
      return;
    }

    app[module.config.productionId].getProdData('downtime', partialProdDowntime._id, function(err, prodDowntime)
    {
      if (!prodDowntime || prodDowntime.status !== 'confirmed')
      {
        return;
      }

      app.broker.publish('prodDowntimes.confirmedEdited', {
        _id: prodDowntime._id,
        rid: prodDowntime.rid,
        user: lastChange.user
      });
    });
  }
};
