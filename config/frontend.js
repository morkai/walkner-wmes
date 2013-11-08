'use strict';

exports.id = 'frontend';

exports.modules = [
  'mongoose',
  'events',
  'httpServer',
  'httpsServer',
  'sio',
  'pubsub',
  //'mailListener',
  'user',
  'express',
  'users',
  'orders',
  'downtimeReasons',
  'aors'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.added', 'users.edited',
      'users.login', 'users.logout',
      'orders.added', 'orders.edited',
      'orderStatuses.added', 'orderStatuses.edited',
      'downtimeReasons.added', 'downtimeReasons.edited',
      'aors.added', 'aors.edited'
    ],
    info: [
      'events.**',
      'orders.synced'
    ],
    warning: [
      'users.deleted',
      'users.loginFailure',
      'orders.deleted',
      'orderStatuses.deleted',
      'downtimeReasons.deleted',
      'aors.deleted'
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
    '*.added', '*.edited', '*.deleted', '*.synced'
  ]
};

exports.sio = {

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

exports.mailListener = {
  username: 'import@wmes.walkner.pl',
  password: 'wmesXSQ1@3xsq',
  host: 'poczta-611475.vipserv.org',
  port: 993,
  tls: true
};

exports.user = {
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'ORDERS:VIEW', 'ORDERS:MANAGE',
    'LINES:VIEW', 'LINES:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'ORDER_STATUSES:VIEW', 'ORDER_STATUSES:MANAGE',
    'DOWNTIME_REASONS:VIEW', 'DOWNTIME_REASONS:MANAGE',
    'AORS:VIEW', 'AORS:MANAGE'
  ]
};
