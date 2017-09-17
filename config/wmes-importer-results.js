'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-importer-results';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  {id: 'directoryWatcher', name: 'directoryWatcher:xiconf'},
  {id: 'directoryWatcher', name: 'directoryWatcher:icpo'},
  'licenses',
  'xiconf'
];

exports.mongoose = {
  uri: mongodb.uri,
  options: Object.assign(mongodb.mongoClient, {
    poolSize: 5
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: ['event', 'xiconfOrderResult', 'xiconfResult', 'icpoResult', 'license']
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 10000,
  versionsKey: 'wmes',
  backendVersionKey: 'importer-results',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign(ports[exports.id], {
  broadcastTopics: [
    'events.saved',
    'xiconf.results.synced',
    'icpo.results.synced'
  ]
});

exports['directoryWatcher:xiconf'] = {
  path: `${__dirname}/../data/xiconf-input`
};

exports['directoryWatcher:icpo'] = {
  path: `${__dirname}/../data/icpo-input`
};

exports.licenses = {
  licenseEd: null
};

exports.xiconf = {
  directoryWatcherId: 'directoryWatcher:xiconf',
  featureDbPath: `${__dirname}/../data/xiconf-features`
};

exports.icpo = {
  directoryWatcherId: 'directoryWatcher:icpo',
  fileStoragePath: `${__dirname}/../data/icpo-files`
};
