// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpSettingsRoutes(app, settingsModule)
{
  const express = app[settingsModule.config.expressId];
  const Setting = app[settingsModule.config.mongooseId].model('Setting');

  express.get('/settings', express.crud.browseRoute.bind(null, app, Setting));
};
