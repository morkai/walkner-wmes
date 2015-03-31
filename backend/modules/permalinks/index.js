// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express'
};

exports.start = function startPermalinksModule(app, module)
{
  var config = module.config;

  app.onModuleReady(
    [
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
