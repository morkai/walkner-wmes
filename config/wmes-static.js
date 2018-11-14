'use strict';

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
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  ejsAmdHelpers: {
    t: 'app/i18n'
  }
};
