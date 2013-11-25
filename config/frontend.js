'use strict';

exports.id = 'frontend';

exports.modules = [
  'mongoose',
  'events',
  'httpServer',
  'httpsServer',
  'sio',
  'pubsub',
  'user',
  'express',
  'users',
  'orders',
  'orderStatuses',
  'downtimeReasons',
  'aors',
  'workCenters',
  'companies',
  'prodTasks',
  'fte',
  {id: 'messenger/client', name: 'messenger/client:attachments'},
  {id: 'messenger/client', name: 'messenger/client:importer'}
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'fte.leader.created', 'fte.master.created'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted'
    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 6080
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 6443,
  key: __dirname + '/privatekey.pem',
  cert: __dirname + '/certificate.pem'
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'shiftChanged',
    'fte.leader.*'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {}
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'wmes.sid',
  cookieSecret: '1ee7\\/\\/mes',
  ejsAmdHelpers: {
    t: 'app/i18n'
  }
};

exports.user = {
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'ORDERS:VIEW', 'ORDERS:MANAGE',
    'LINES:VIEW', 'LINES:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'FTE:LEADER:VIEW', 'FTE:LEADER:MANAGE',
    'FTE:MASTER:VIEW', 'FTE:MASTER:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE'
  ]
};

exports['messenger/client:attachments'] = {
  pubHost: '127.0.0.1',
  pubPort: 60010,
  repHost: '127.0.0.1',
  repPort: 60011,
  responseTimeout: 5000
};

exports['messenger/client:importer'] = {
  pubHost: '127.0.0.1',
  pubPort: 60020,
  repHost: '127.0.0.1',
  repPort: 60021,
  responseTimeout: 5000
};
