'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-help';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'messenger/server',
  'gdrive',
  'help'
];

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
  insertDelay: 1000,
  topics: {
    debug: [
      'help.files.deleted'
    ],
    info: [
      'events.**'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 3,
    readPreference: 'secondaryPreferred'
  }),
  maxConnectTries: 5,
  connectAttemptDelay: 500,
  models: [
    'event',
    'setting',
    'helpFile'
  ]
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'help',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved'
  ]
});

exports.settings = {
  expressId: null
};

exports.gdrive = {
  key: require(process.env.WMES_GDRIVE_KEY || './gdrive.private.json')
};

exports.help = {
  expressId: null,
  userId: null
};
