'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-planning';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'messenger/server',
  'orders',
  'planning'
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
  options: Object.assign(mongodb.mongoClient, {
    poolSize: 3,
    readPreference: 'secondaryPreferred'
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event', 'setting', 'hourlyPlan', 'order', 'plan', 'planChange', 'planSettings'
  ]
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
    'planning.changes.created'
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
