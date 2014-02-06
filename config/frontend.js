'use strict';

exports.id = 'frontend';

exports.modules = [
  'updater',
  'mongoose',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'companies',
  'divisions',
  'subdivisions',
  'mrpControllers',
  'workCenters',
  'prodFlows',
  'prodLines',
  'aors',
  'orderStatuses',
  'downtimeReasons',
  'lossReasons',
  'prodTasks',
  'orders',
  'fte',
  'hourlyPlans',
  'production',
  'prodDowntimes',
  'prodLogEntries',
  'prodShifts',
  'prodShiftOrders',
  'pressWorksheets',
  'reports',
  {id: 'messenger/client', name: 'messenger/client:importer'},
  'httpServer',
  'httpsServer',
  'sio'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'fte.leader.created', 'fte.leader.locked',
      'fte.master.created', 'fte.master.locked',
      'hourlyPlans.created', 'hourlyPlans.locked'
    ],
    info: [
      'events.**',
      'users.synced',
      'mechOrders.synced'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted'
    ],
    error: [
      'users.syncFailed'
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
    'fte.master.*', 'fte.leader.*', 'hourlyPlans.*',
    'users.syncFailed',
    'production.synced.*',
    'prodDowntimes.created.*', 'prodDowntimes.finished.*', 'prodDowntimes.corroborated.*',
    'updater.newVersion'
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
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
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
    'FTE:LEADER:VIEW', 'FTE:LEADER:MANAGE', 'FTE:LEADER:ALL',
    'FTE:MASTER:VIEW', 'FTE:MASTER:MANAGE', 'FTE:MASTER:ALL',
    'HOURLY_PLANS:VIEW', 'HOURLY_PLANS:MANAGE', 'HOURLY_PLANS:ALL',
    'PROD_DOWNTIMES:VIEW', 'PROD_DOWNTIMES:MANAGE',
    'PRESS_WORKSHEETS:VIEW', 'PRESS_WORKSHEETS:MANAGE',
    'PROD_DATA:VIEW',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW'
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

exports.updater = {
  manifestPath: __dirname + '/manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  }
};
