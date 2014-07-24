'use strict';

exports.id = 'pos-importer';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'directoryWatcher',
  'mail/listener',
  'mail/downloader',
  'purchaseOrders/importer'
];

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

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {
    server: {poolSize: 5}
  },
  models: ['event', 'purchaseOrder']
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
  searchFilter: ['UNSEEN']
};

exports['mail/downloader'] = {
  savePath: exports.directoryWatcher.path,
  timestamp: true
};

exports['purchaseOrders/importer'] = {
  parsedOutputDir: __dirname + '/../data/attachments-imported'
};
