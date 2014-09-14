// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function setUpFactoryLayoutRoutes(app, factoryLayoutModule)
{
  var express = app[factoryLayoutModule.config.expressId];
  var settings = app[factoryLayoutModule.config.settingsId];
  var FactoryLayout = app[factoryLayoutModule.config.mongooseId].model('FactoryLayout');
  var canManage = app[factoryLayoutModule.config.userId].auth('FACTORY_LAYOUT:MANAGE');

  express.get(
    '/factoryLayout/settings',
    function limitToReportSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^factoryLayout\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/factoryLayout/settings/:id', canManage, settings.updateRoute);

  express.get('/factoryLayout/:id', canManage, express.crud.readRoute.bind(null, app, FactoryLayout));
};
