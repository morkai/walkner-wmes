'use strict';

require('later').date.localTime();

exports.id = 'wmes-sapgui';

exports.modules = [
  {id: 'h5-express', name: 'express'},
  'directoryWatcher',
  'sapGui',
  'httpServer'
];

exports.directoryWatcher = {
  path: 'C:/SAP/Output'
};

exports.sapGui = {
  jobs: [],
  outputPath: exports.directoryWatcher.path
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80,
  availabilityTopics: ['app.started']
};

exports.express = {
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  sessionCookieKey: 'wmes-sapgui.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0
  },
  cookieSecret: '1ee7\\/\\/mes$@P',
  textBody: {limit: '1mb'},
  jsonBody: {limit: '1mb'}
};
