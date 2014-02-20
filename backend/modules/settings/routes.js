'use strict';

var crud = require('../express/crud');

module.exports = function setUpSettingsRoutes(app, settingsModule)
{
  var express = app[settingsModule.config.expressId];
  var Setting = app[settingsModule.config.mongooseId].model('Setting');

  express.get('/settings', crud.browseRoute.bind(null, app, Setting));
};
