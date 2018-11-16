'use strict';

const frontendConfig = require('./wmes-frontend');

exports.id = 'wmes-static';

exports.modules = [
  'express/static',
  'httpServer'
];

exports.httpServer = {
  expressId: 'express/static',
  host: '0.0.0.0',
  port: 81
};

exports['express/static'] = {
  staticPath: frontendConfig.express.staticPath,
  staticBuildPath: frontendConfig.express.staticBuildPath,
  ejsAmdHelpers: frontendConfig.express.ejsAmdHelpers
};
