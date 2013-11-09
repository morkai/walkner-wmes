'use strict';

exports.id = 'importer';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'directoryWatcher',
  'orders/importer/orders'
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
  uri: require('./mongodb').uri,
  options: {
    server: {poolSize: 5}
  }
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60020,
  repHost: '127.0.0.1',
  repPort: 60021,
  broadcastTopics: [
    'events.saved',
    'orders.synced'
  ]
};

exports['orders/importer/orders'] = {
  stepCount: 8
};

exports.directoryWatcher = {
  path: __dirname + '/../data/attachments'
};
