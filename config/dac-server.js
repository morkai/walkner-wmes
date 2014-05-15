'use strict';

exports.id = 'dac-server';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'dac/server',
  'express',
  'httpServer'
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
    server: {poolSize: 3}
  },
  models: ['event', 'dacLogEntry']
};

exports['messenger/server'] = {
  pubHost: '0.0.0.0',
  pubPort: 60040,
  repHost: '0.0.0.0',
  repPort: 60041,
  broadcastTopics: [
    'events.saved',
    'dac.synced'
  ]
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 6081
};

exports.express = require('./frontend').express;
