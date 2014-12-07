'use strict';

exports.id = 'wmes-attachments';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  'mail/listener',
  'mail/downloader'
];

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 2}
  },
  models: ['event']
};

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

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'attachments',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60010,
  repHost: '127.0.0.1',
  repPort: 60011,
  broadcastTopics: [
    'events.saved'
  ]
};

exports['mail/listener'] = {
  username: 'someone@the.net',
  password: '123456',
  host: 'smtp.server.net',
  port: 993,
  tls: true
};

exports['mail/downloader'] = {
  savePath: __dirname + '/../data/attachments-input',
  timestamp: true
};
