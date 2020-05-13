'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-planning';

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'settings',
  'events',
  'messenger/server',
  'orders',
  'planning',
  'paintShop',
  'wmes-drilling',
  'wmes-wiring',
  'wh'
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
    poolSize: 10,
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
  backendVersionKey: 'planning',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved',
    'planning.generator.started', 'planning.generator.finished', 'planning.changes.created',
    'paintShop.orders.changed.*',
    'drilling.orders.changed.*',
    'wiring.orders.changed.*',
    'old.wh.generator.started', 'old.wh.generator.finished', 'old.wh.orders.changed.*',
    'wh.generator.started', 'wh.generator.finished', 'wh.orders.changed.*',
    'orders.updated.*'
  ]
});

exports.settings = {
  expressId: null
};

exports.orders = {
  expressId: null,
  userId: null,
  syncPsStatus: {
    generator: true,
    updater: false
  }
};

exports.planning = {
  expressId: null,
  generator: true
};

exports.paintShop = {
  generator: true
};

exports.wh = {
  generator: true
};

exports['wmes-wh'] = {
  generator: true
};

exports['wmes-drilling'] = {
  generator: true
};

exports['wmes-wiring'] = {
  generator: true
};
