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
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user',
    'twilioRequest', 'twilioResponse'
  ]
};
exports.mongoose.options.server.poolSize = 2;

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

exports.twilio = {

};

exports.watchdog = {
  recipients: [],
  appStartedRecipients: [],
  noEventRecipients: [],
  events: [],
  emptyDirectories: []
};
