'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-alerts';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  'fte',
  'mail/sender',
  'sms/sender',
  'prodDowntimeAlerts'
];

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 3
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event',
    'user', 'aor', 'downtimeReason', 'prodFlow', 'workCenter', 'prodLine',
    'prodShiftOrder', 'prodDowntime', 'prodDowntimeAlert', 'prodLogEntry'
  ]
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
  restartDelay: 10000,
  versionsKey: 'wmes',
  backendVersionKey: 'alerts',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved',
    'production.logEntries.saved'
  ]
});

exports.fte = {
  mongooseId: null,
  expressId: null,
  userId: null,
  sioId: null,
  divisionsId: null,
  subdivisionsId: null,
  settingsId: null
};

exports['mail/sender'] = {

};

exports['sms/sender'] = {

};

exports.prodDowntimeAlerts = {
  messengerServerId: 'messenger/server',
  messengerClientId: null,
  expressId: null,
  userId: null
};
