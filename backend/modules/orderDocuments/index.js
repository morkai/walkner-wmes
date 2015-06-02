// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  updaterId: 'updater',
  orgUnitsId: 'orgUnits',
  settingsId: 'settings',
  productionId: 'production',
  importPath: './',
  importFile: '{timestamp}@T_COOIS_DOCS_{step}.txt'
};

exports.start = function startOrderDocumentsModule(app, module)
{
  module.settings = {
    path: '',
    extra: []
  };

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
      });
    }
  );

  app.broker.subscribe('settings.updated.orders.documents.**', function(message)
  {
    if (message._id === 'orders.documents.path')
    {
      module.settings.path = message.value;
    }
    else if (message._id === 'orders.documents.extra')
    {
      module.settings.extra = parseExtraDocumentsSetting(message.value);

      app.broker.publish('orderDocuments.extraUpdated', module.settings.extra);
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
          pattern: name,
          documents: documents
        });
      });
    });

    return extra;
  }
};
