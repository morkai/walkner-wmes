// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const generateLicenseKey = require('./generateLicenseKey');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  licenseEd: {
    pem: null,
    password: null
  },
  defaultLicensee: ''
};

exports.start = function startLicensesModule(app, module)
{
  const config = module.config;

  module.licenseEdKey = null;

  if (config.licenseEd.pem)
  {
    const ursa = require('strong-ursa');

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
