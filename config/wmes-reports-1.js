'use strict';

var mongodb = require('./wmes-mongodb');

exports.id = 'wmes-reports-1';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  'reports/server'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started'
    ],
    info: [
      'events.**'
    ]
  }
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event',
    'prodShift', 'prodShiftOrder', 'prodDowntime',
    'fteMasterEntry', 'fteLeaderEntry',
    'clipOrderCount',
    'whShiftMetrics'
  ]
};
exports.mongoose.options.server.poolSize = 10;

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'reports',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60050,
  repHost: '127.0.0.1',
  repPort: 60051,
  pullHost: '127.0.0.1',
  pullPort: 60052,
  broadcastTopics: [
    'events.saved'
  ]
};
