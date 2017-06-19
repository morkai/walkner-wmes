// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var generateLicenseKey = require('./generateLicenseKey');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  licenseEd: {
    pem: null,
    password: null
  }
};

exports.start = function startLicensesModule(app, module)
{
  var config = module.config;

  module.licenseEdKey = null;

  if (config.licenseEd.pem)
  {
    var ursa = require('ursa');

    if (config.licenseEd.password)
    {
      module.licenseEdKey = ursa.createPrivateKey(config.licenseEd.pem, config.licenseEd.password);
    }
    else
    {
      module.licenseEdKey = ursa.createPrivateKey(config.licenseEd.pem);
    }
  }

  module.generateLicenseKey = generateLicenseKey.bind(null, module.licenseEdKey);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
