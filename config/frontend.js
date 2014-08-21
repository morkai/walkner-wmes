'use strict';

exports.id = 'frontend';

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
  'mrpControllers',
  'workCenters',
  'prodFlows',
  'prodLines',
  'orgUnits',
  'aors',
  'orderStatuses',
  'downtimeReasons',
  'lossReasons',
  'prodFunctions',
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
  'feedback',
  'xiconf',
  'licenses',
  {id: 'messenger/client', name: 'messenger/client:importer'},
  {id: 'messenger/client', name: 'messenger/client:xiconf'},
  'httpServer',
  'httpsServer',
  'sio'
];

exports.dictionaryModules = {
  prodFunctions: 'PROD_FUNCTIONS',
  companies: 'COMPANIES',
  divisions: 'DIVISIONS',
  subdivisions: 'SUBDIVISIONS',
  mrpControllers: 'MRP_CONTROLLERS',
  prodFlows: 'PROD_FLOWS',
  workCenters: 'WORK_CENTERS',
  prodLines: 'PROD_LINES',
  aors: 'AORS',
  orderStatuses: 'ORDER_STATUSES',
  downtimeReasons: 'DOWNTIME_REASONS'
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'fte.leader.created', 'fte.master.created',
      'hourlyPlans.created'
    ],
    info: [
      'events.**',
      '*.synced'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'fte.leader.deleted', 'fte.master.deleted'
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

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: __dirname + '/privatekey.pem',
  cert: __dirname + '/certificate.pem'
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'shiftChanged',
    'fte.master.**', 'fte.leader.**',
    'hourlyPlans.created', 'hourlyPlans.updated.*',
    'users.syncFailed',
    'production.synced.*', 'production.edited.**',
    'prodShifts.**',
    'prodDowntimes.**',
    'prodShiftOrders.**',
    'updater.newVersion',
    'settings.updated.**',
    'purchaseOrders.printed.*', 'purchaseOrders.cancelled.*'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {},
  models: [
    'setting', 'event', 'user',
    'division', 'subdivision', 'mrpController', 'workCenter', 'prodFlow', 'prodLine',
    'company', 'vendor', 'prodFunction', 'aor',
    'orderStatus', 'downtimeReason', 'lossReason', 'prodTask',
    'order', 'mechOrder', 'emptyOrder', 'clipOrderCount',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan',
    'prodLogEntry', 'prodShift', 'prodShiftOrder', 'prodDowntime', 'pressWorksheet',
    'feedback',
    'license', 'licensePing',
    'xiconfOrder', 'xiconfResult'
  ]
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
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'FTE:LEADER:VIEW', 'FTE:LEADER:MANAGE', 'FTE:LEADER:ALL',
    'FTE:MASTER:VIEW', 'FTE:MASTER:MANAGE', 'FTE:MASTER:ALL',
    'HOURLY_PLANS:VIEW', 'HOURLY_PLANS:MANAGE', 'HOURLY_PLANS:ALL',
    'PROD_DOWNTIMES:VIEW', 'PROD_DOWNTIMES:MANAGE', 'PROD_DOWNTIMES:ALL',
    'PRESS_WORKSHEETS:VIEW', 'PRESS_WORKSHEETS:MANAGE',
    'PROD_DATA:VIEW', 'PROD_DATA:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW', 'REPORTS:MANAGE',
    'XICONF:VIEW', 'XICONF:MANAGE'
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

exports['messenger/client:xiconf'] = {
  pubHost: '127.0.0.1',
  pubPort: 60030,
  repHost: '127.0.0.1',
  repPort: 60031,
  responseTimeout: 5000
};

exports['messenger/client:pos-importer'] = {
  pubHost: '127.0.0.1',
  pubPort: 60040,
  repHost: '127.0.0.1',
  repPort: 60041,
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

exports.reports = {
  javaBatik: 'java -jar c:/programs/batik/batik-rasterizer.jar'
};

exports.xiconf = {
  zipStoragePath: __dirname + '/../data/xiconf',
  featureDbPath: __dirname + '/../data/xiconf-features'
};
