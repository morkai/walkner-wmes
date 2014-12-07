'use strict';

exports.id = 'pos-importer';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  'directoryWatcher',
  'mail/listener',
  'mail/downloader',
  'purchaseOrders/importer'
];

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./pos-mongodb').uri,
  options: {
    server: {poolSize: 5}
  },
  models: ['event', 'purchaseOrder', 'purchaseOrderPrint', 'vendor']
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started'
    ],
    info: [
      'events.**',
      'purchaseOrders.synced'
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
      filterRe: /^OPEN_PO_([0-9]+)\.txt$/,
      stepCount: 1,
      hourlyInterval: 3
    },
    {
      type: 'json',
      filterRe: /^OPEN_PO_([0-9]+)\.json$/,
      stepCount: 1,
      hourlyInterval: 3
    }
  ]
};
