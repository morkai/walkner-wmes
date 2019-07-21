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
    poolSize: 5,
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
    'planning.generator.started',
    'planning.generator.finished',
    'planning.changes.created',
    'paintShop.orders.changed.*',
    'drilling.orders.changed.*',
    'wh.orders.changed.*'
  ]
});

exports.settings = {
  expressId: null
};

exports.orders = {
  expressId: null,
  userId: null
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

exports['wmes-drilling'] = {
  generator: true
};
