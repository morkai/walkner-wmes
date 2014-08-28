// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function setUpFactoryLayoutCommands(app, factoryLayoutModule)
{
  var sio = app[factoryLayoutModule.config.sioId];
  var mongoose = app[factoryLayoutModule.config.mongooseId];
  var userModule = app[factoryLayoutModule.config.userId];
};
