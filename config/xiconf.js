'use strict';

exports.id = 'xiconf';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'directoryWatcher',
  'licenses',
  'xiconf'
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
  models: ['event', 'xiconfOrder', 'xiconfResult', 'license']
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60030,
  repHost: '127.0.0.1',
  repPort: 60031,
  broadcastTopics: [
    'events.saved',
    'xiconf.synced'
  ]
};

exports.directoryWatcher = {
  path: __dirname + '/../data/xiconf'
};

exports.licenses = {
  licenseEd: null
};

exports.xiconf = {
  featureDbPath: __dirname + '/../data/xiconf-features'
};
