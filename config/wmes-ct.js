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
  'paintShop/loadMonitor',
  'wmes-ct-backend',
  'wmes-gft-backend'
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
    'ct.pces.saved',
    'paintShop.load.changed',
    'gft.stations.updated.**'
  ]
});

exports['wmes-ct-backend'] = {

};

exports['wmes-gft-backend'] = {

};

exports['paintShop/loadMonitor'] = {
  master: {
    connection: {
      type: 'tcp',
      socketOptions: {
        host: '127.0.0.1',
        port: 502
      },
      noActivityTime: 3000
    },
    transport: {
      type: 'ip'
    },
    maxConcurrentTransactions: 1,
    defaultUnit: 1,
    defaultMaxRetries: 0,
    defaultTimeout: 200,
    suppressTransactionErrors: true
  }
};
