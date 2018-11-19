'use strict';

var mongodb = require('./pos-mongodb');

exports.id = 'pos-importer';

exports.modules = [
  {id: 'h5-mongoose', name: 'mongoose'},
  'events',
  'updater',
  'messenger/server',
  'directoryWatcher',
  'purchaseOrders/importer'
];

exports.mongoose = {
  uri: mongodb.uri,
  options: Object.assign(mongodb.mongoClient, {
    poolSize: 2
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**',
      'purchaseOrders.synced'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  versionsKey: 'pos',
  backendVersionKey: 'importer',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60040,
  repHost: '127.0.0.1',
  repPort: 60041,
  broadcastTopics: [
    'events.saved',
    'purchaseOrders.synced'
  ]
};

exports.directoryWatcher = {
  path: __dirname + '/../data/attachments-input'
};

exports['mail/listener'] = {
  mailParserOptions: {streamAttachments: false},
  searchFilter: ['UNSEEN'],
  restartMinutes: [20]
};

exports['mail/downloader'] = {
  savePath: exports.directoryWatcher.path,
  timestamp: true
};

exports['purchaseOrders/importer'] = {
  parsedOutputDir: __dirname + '/../data/attachments-imported',
  lateDataDelay: 30 * 60 * 1000,
  parsers: [
    {
      type: 'html',
      filterRe: /^Job .*?_OPEN_PO_D, Step ([0-9]+)\.html?$/,
      stepCount: 10,
      hourlyInterval: 3
    },
    {
      type: 'text',
      filterRe: /^OPEN_PO\.txt$/,
      stepCount: 1,
      hourlyInterval: 3
    },
    {
      type: 'json',
      filterRe: /^OPEN_PO\.json$/,
      stepCount: 1,
      hourlyInterval: 3
    }
  ]
};
