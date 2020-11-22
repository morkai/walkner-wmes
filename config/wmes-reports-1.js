'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-reports-1';

Object.assign(exports, require('./wmes-common'));

exports.modules = [
  {id: 'h5-mongoose', name: 'mongoose'},
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

    ],
    info: [
      'events.**'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 8,
    readPreference: 'secondaryPreferred'
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'reports',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id].server, {
  broadcastTopics: [
    'events.saved'
  ]
});

exports['reports/server'] = {
  reports: require('./wmes-reports')
};
