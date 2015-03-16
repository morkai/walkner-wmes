'use strict';

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
      'app.started'
    ],
    info: [
      'events.**'
    ],
    warning: [

    ],
    error: [

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
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 15}
  },
  models: [
    'setting', 'event', 'user'
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

exports.watchdog = {
  recipients: [],
  events: []
};
