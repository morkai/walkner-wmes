'use strict';

var mongodb = require('./wmes-mongodb');
var later = require('later');
later.date.localTime();

exports.id = 'wmes-watchdog';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'mail/sender',
  'sms/sender',
  'twilio',
  'messenger/server',
  'watchdog'
];

exports.dictionaryModules = {

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
    warning: [

    ],
    error: [
      'app.started'
    ]
  },
  blacklist: [

  ]
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: Object.assign(mongodb.mongoClient, {
    poolSize: 2
  }),
  maxConnectTries: 0,
  connectAttemptDelay: 250,
  stopOnConnectError: false,
  models: [
    'setting', 'event', 'user',
    'twilioRequest', 'twilioResponse'
  ]
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60070,
  repHost: '127.0.0.1',
  repPort: 60071,
  responseTimeout: 5000,
  broadcastTopics: [
    'events.saved'
  ]
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'watchdog',
  frontendVersionKey: null
};

exports['mail/sender'] = {
  from: 'WMES Bot <wmes@localhost>'
};

exports['sms/sender'] = {

};

exports.twilio = {

};

exports.watchdog = {
  recipients: [],
  appStartedRecipients: [],
  noEventRecipients: [],
  events: [],
  emptyDirectories: [],
  ping: {
    secretKey: '?',
    remoteUrl: 'http://wmes/watchdog/ping',
    localUrl: 'http://127.0.0.1/ping',
    interval: 0,
    window: 0
  }
};
