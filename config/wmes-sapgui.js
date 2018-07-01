'use strict';

require('later').date.localTime();

exports.id = 'wmes-sapgui';

exports.modules = [
  'express',
  'directoryWatcher',
  'sapGui',
  {id: 'sapGui/exporter', name: 'sapGui/exporter:walkner-pos'},
  {id: 'sapGui/exporter', name: 'sapGui/exporter:philips-wmes'},
  'httpServer'
];

exports.directoryWatcher = {
  path: 'C:/SAP/Output'
};

exports.sapGui = {
  jobs: [],
  outputPath: exports.directoryWatcher.path
};

exports['sapGui/exporter:walkner-pos'] = {
  maxConcurrentUploads: 1,
  secretKey: '',
  filters: []
};

exports['sapGui/exporter:philips-wmes'] = {
  maxConcurrentUploads: 1,
  secretKey: '',
  filters: []
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
