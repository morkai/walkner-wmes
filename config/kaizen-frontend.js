'use strict';

var mongodb = require('./kaizen-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/]
  });
}
catch (err) {}

var DATA_PATH = __dirname + '/../data';

exports.id = 'kaizen-frontend';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'companies',
  'divisions',
  'subdivisions',
  'prodFunctions',
  'prodTasks',
  'kaizen',
  'permalinks',
  'mail/sender',
  'httpServer',
  'sio'
];

exports.mainJsFile = '/kaizen-main.js';
exports.mainCssFile = '/assets/kaizen-main.css';
exports.faviconFile = 'assets/kaizen-favicon.ico';

exports.dashboardUrlAfterLogIn = '/';

exports.frontendAppData = {
  KAIZEN_MULTI: false
};

exports.dictionaryModules = {
  prodFunctions: 'PROD_FUNCTIONS',
  companies: 'COMPANIES',
  divisions: 'DIVISIONS',
  subdivisions: 'SUBDIVISIONS'
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'kaizen.*.added', 'kaizen.*.edited'
    ],
    info: [
      'events.**',
      'users.synced'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'kaizen.*.deleted'
    ],
    error: [
      '*.syncFailed'
    ]
  },
  blacklist: [
    'kaizen.orders.added', 'kaizen.orders.edited'
  ]
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
    'kaizen.*.added', 'kaizen.*.edited', 'kaizen.*.deleted', 'kaizen.orders.seen.*'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user',
    'division', 'subdivision',
    'company', 'prodFunction', 'prodTask', 'vendor',
    'kaizenSection', 'kaizenArea', 'kaizenCategory', 'kaizenCause', 'kaizenRisk', 'kaizenOrder'
  ]
};
exports.mongoose.options.server.poolSize = 5;

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'kaizen.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  cookieSecret: '1ee7KaI-Z{n',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  textBody: {limit: '3mb'},
  jsonBody: {limit: '1mb'}
};

exports.user = {
  localAddresses: [/^192\.168\./],
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'KAIZEN:MANAGE', 'KAIZEN:DICTIONARIES:VIEW', 'KAIZEN:DICTIONARIES:MANAGE'
  ]
};

exports.updater = {
  manifestPath: __dirname + '/kaizen-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'kaizen',
  manifests: [
    {
      path: '/manifest.appcache',
      mainJsFile: exports.mainJsFile,
      mainCssFile: exports.mainCssFile
    }
  ]
};

exports['mail/sender'] = {
  from: 'WMES Bot <wmes@localhost>'
};

exports.kaizen = {
  attachmentsDest: DATA_PATH + '/kaizen-attachments',
  multiType: exports.frontendAppData.KAIZEN_MULTI
};
