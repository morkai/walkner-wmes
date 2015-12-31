// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var checkRemoteServer = require('./checkRemoteServer');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  updaterId: 'updater',
  orgUnitsId: 'orgUnits',
  settingsId: 'settings',
  productionId: 'production',
  cachedPath: './',
  sejdaConsolePath: 'sejda-console'
};

exports.start = function startOrderDocumentsModule(app, module)
{
  module.settings = {
    path: '',
    extra: [],
    remoteServer: ''
  };

  module.checkRemoteServer = checkRemoteServer.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.updaterId,
      module.config.orgUnitsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.sioId,
      module.config.productionId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.settingsId
    ],
    function()
    {
      app[module.config.settingsId].findValues({_id: /^orders\.documents/}, 'orders.documents.', function(err, settings)
      {
        if (err)
        {
          return module.error("Failed to find settings: %s", err.message);
        }

        if (_.isString(settings.path))
        {
          module.settings.path = settings.path;
        }

        if (_.isString(settings.extra))
        {
          module.settings.extra = parseExtraDocumentsSetting(settings.extra);
        }

        if (_.isString(settings.remoteServer))
        {
          module.settings.remoteServer = settings.remoteServer;
        }
      });
    }
  );

  app.broker.subscribe('app.started', removeOldClients).setLimit(1);

  app.broker.subscribe('settings.updated.orders.documents.**', function(message)
  {
    var settings = module.settings;
    var settingId = message._id;
    var settingValue = message.value;

    if (settingId === 'orders.documents.path')
    {
      settings.path = settingValue;
    }
    else if (settingId === 'orders.documents.extra')
    {
      settings.extra = parseExtraDocumentsSetting(settingValue);

      app.broker.publish('orderDocuments.extraUpdated', settings.extra);
    }
    else if (settingId === 'orders.documents.remoteServer')
    {
      settings.remoteServer = settingValue;
    }
  });

  function parseExtraDocumentsSetting(rawValue)
  {
    var extra = [];

    if (!_.isString(rawValue) || _.isEmpty(rawValue))
    {
      return extra;
    }

    var lastName = '';
    var namesToDocuments = {};

    _.forEach(rawValue.split('\n'), function(line)
    {
      var matches = line.match(/([0-9]{15})\s+(.*?)$/);

      if (matches)
      {
        if (lastName === '')
        {
          return;
        }

        namesToDocuments[lastName][matches[1]] = matches[2];
      }
      else
      {
        lastName = line;

        namesToDocuments[lastName] = {};
      }
    });

    _.forEach(namesToDocuments, function(documents, names)
    {
      names = names
        .split(';')
        .map(function(name) { return name.trim(); })
        .filter(function(name) { return !!name.length; });

      if (!names.length)
      {
        return;
      }

      _.forEach(names, function(name)
      {
        extra.push({
          pattern: prepareExtraDocumentPattern(name),
          documents: documents
        });
      });
    });

    return extra;
  }

  function prepareExtraDocumentPattern(name)
  {
    try
    {
      return new RegExp(name);
    }
    catch (err)
    {
      return name;
    }
  }

  function removeOldClients()
  {
    var mongoose = app[module.config.mongooseId];

    if (!mongoose)
    {
      return;
    }

    var conditions = {
      disconnectedAt: {$lt: moment().subtract(7, 'days').toDate()}
    };

    mongoose.model('OrderDocumentClient').remove(conditions, function(err)
    {
      if (err)
      {
        module.error("Failed to remove old clients: %s", err.message);
      }

      setTimeout(removeOldClients, 24 * 3600 * 1000);
    });
  }
};
