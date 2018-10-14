'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

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
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 2
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: ['event']
};

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

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'attachments',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved'
  ]
});

exports['mail/listener'] = {
  username: 'someone@the.net',
  password: '123456',
  host: 'smtp.server.net',
  port: 993,
  tls: true
};

exports['mail/downloader'] = {
  savePath: `${__dirname}/../data/attachments-input`,
  timestamp: true
};
