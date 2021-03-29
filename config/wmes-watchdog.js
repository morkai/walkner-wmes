'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');
const later = require('later');

later.date.localTime();

exports.id = 'wmes-watchdog';

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'settings',
  'events',
  'pubsub',
  'mail/sender',
  'sms/sender',
  {id: 'h5-twilio', name: 'twilio'},
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
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 2
  }),
  maxConnectTries: 0,
  connectAttemptDelay: 250,
  stopOnConnectError: false
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  responseTimeout: 5000,
  broadcastTopics: [
    'events.saved'
  ]
});

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
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
  pings: {
    frontend: {
      secretKey: '?',
      remoteUrl: 'http://wmes/watchdog/ping',
      localUrl: 'http://127.0.0.1/ping',
      interval: 0,
      window: 0
    }
  }
};
