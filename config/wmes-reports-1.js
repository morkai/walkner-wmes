'use strict';

exports.id = 'wmes-reports';

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
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 5}
  },
  models: [
    'event',
    'ProdShift', 'ProdShiftOrder', 'ProdDowntime',
    'FteMasterEntry', 'FteLeaderEntry',
    'ClipOrderCount'
  ]
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 1337,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
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
