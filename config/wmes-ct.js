'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-ct';

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'events',
  'settings',
  'messenger/server',
  'wmes-ct-backend'
];

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
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
    poolSize: 3
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
  backendVersionKey: 'ct',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved',
    'ct.state.updated',
    'ct.pces.saved'
  ]
});

exports['wmes-ct-backend'] = {

};
