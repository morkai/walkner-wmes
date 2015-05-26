'use strict';

var mongodb = require('./pos-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/]
  });
}
catch (err) {}

exports.id = 'pos-frontend';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'vendors',
  'vendorNc12s',
  'feedback',
  'purchaseOrders',
  {id: 'messenger/client', name: 'messenger/client:pos-importer'},
  'httpServer',
  'sio'
];

exports.mainJsFile = '/pos-main.js';
exports.mainCssFile = '/assets/pos-main.css';

exports.dictionaryModules = {

};

exports.dashboardUrlAfterLogIn = '/purchaseOrders';

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted'
    ],
    error: [
      '*.syncFailed'
    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'users.syncFailed',
    'updater.newVersion',
    'settings.updated.**',
    'purchaseOrders.printed.*', 'purchaseOrders.cancelled.*'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user',
    'vendor',
    'vendorNc12',
    'feedback',
    'purchaseOrder', 'purchaseOrderPrint'
  ]
};
exports.mongoose.options.server.poolSize = 10;

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'wmes-pos.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  cookieSecret: '1ee7\\/\\/mes+pos',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  textBody: {
    limit: '1mb'
  }
};

exports.user = {
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'PURCHASE_ORDERS:VIEW', 'PURCHASE_ORDERS:MANAGE',
    'VENDOR_NC12S:VIEW', 'VENDOR_NC12S:MANAGE'
  ]
};

exports['messenger/client:pos-importer'] = {
  pubHost: '127.0.0.1',
  pubPort: 60040,
  repHost: '127.0.0.1',
  repPort: 60041,
  responseTimeout: 5000
};

exports.updater = {
  manifestPath: __dirname + '/pos-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'pos',
  manifests: [
    {
      path: 'manifest.appcache',
      mainJsFile: exports.mainJsFile,
      mainCssFile: exports.mainCssFile
    }
  ]
};

exports.purchaseOrders = {
  pdfStoragePath: __dirname + '/../data/pos-labels',
  renderCmdPath: __dirname + '/../data/pos-render',
  importPath: __dirname + '/../data/attachments-input'
};
