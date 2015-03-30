'use strict';

exports.id = 'wmes-importer-results';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  {id: 'directoryWatcher', name: 'directoryWatcher:xiconf'},
  {id: 'directoryWatcher', name: 'directoryWatcher:icpo'},
  'licenses',
  'xiconf',
  'icpo'
];

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 3}
  },
  models: ['event', 'xiconfOrderResult', 'xiconfResult', 'icpoResult', 'license']
};

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

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  versionsKey: 'wmes',
  backendVersionKey: 'importer-results',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60030,
  repHost: '127.0.0.1',
  repPort: 60031,
  broadcastTopics: [
    'events.saved',
    'xiconf.results.synced',
    'icpo.results.synced'
  ]
};

exports['directoryWatcher:xiconf'] = {
  path: __dirname + '/../data/xiconf-input'
};

exports['directoryWatcher:icpo'] = {
  path: __dirname + '/../data/icpo-input'
};

exports.licenses = {
  licenseEd: null
};

exports.xiconf = {
  directoryWatcherId: 'directoryWatcher:xiconf',
  featureDbPath: __dirname + '/../data/xiconf-features'
};

exports.icpo = {
  directoryWatcherId: 'directoryWatcher:icpo',
  fileStoragePath: __dirname + '/../data/icpo-files'
};
