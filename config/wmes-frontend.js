'use strict';

var DATA_PATH = __dirname + '/../data';

exports.id = 'wmes-frontend';

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
  'xiconf',
  'icpo',
  'warehouse',
  'licenses',
  'factoryLayout',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-sap'},
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-results'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-1'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-2'},
  'httpServer',
  'sio'
];

exports.mainJsFile = 'wmes-main.js';
exports.mainCssFile = 'assets/wmes-main.css';

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
      '*.added', '*.edited'
    ],
    info: [
      'events.**',
      'mechOrders.synced',
      'users.synced',
      'production.unlocked',
      'production.locked'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'fte.leader.deleted', 'fte.master.deleted',
      'production.unlockFailure',
      'production.lockFailure'
    ],
    error: [
      '*.syncFailed'
    ]
  },
  blacklist: [
    'pressWorksheets.added'
  ]
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
    'production.synced.**', 'production.edited.**', 'production.stateChanged.**',
    'prodShifts.**',
    'prodDowntimes.**',
    'prodShiftOrders.**',
    'updater.newVersion',
    'settings.updated.**'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 15}
  },
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
    'xiconfOrder', 'xiconfResult', 'xiconfProgram', 'icpoResult',
    'factoryLayout',
    'whTransferOrder'
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
  },
  textBody: {limit: '3mb'},
  jsonBody: {limit: '1mb'}
};

exports.user = {
  localAddresses: [/^192\.168\./],
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
    'XICONF:VIEW', 'XICONF:MANAGE', 'ICPO:VIEW', 'ICPO:MANAGE',
    'FACTORY_LAYOUT:MANAGE'
  ]
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60000,
  repHost: '127.0.0.1',
  repPort: 60001,
  responseTimeout: 5000,
  broadcastTopics: [
    'fte.leader.updated.*'
  ]
};

exports['messenger/client:wmes-attachments'] = {
  pubHost: '127.0.0.1',
  pubPort: 60010,
  repHost: '127.0.0.1',
  repPort: 60011,
  responseTimeout: 5000
};

exports['messenger/client:wmes-importer-sap'] = {
  pubHost: '127.0.0.1',
  pubPort: 60020,
  repHost: '127.0.0.1',
  repPort: 60021,
  responseTimeout: 5000
};

exports['messenger/client:wmes-importer-results'] = {
  pubHost: '127.0.0.1',
  pubPort: 60030,
  repHost: '127.0.0.1',
  repPort: 60031,
  responseTimeout: 5000
};

exports['messenger/client:wmes-reports-1'] = {
  pubHost: '127.0.0.1',
  pubPort: 60050,
  repHost: '127.0.0.1',
  repPort: 60051,
  pushHost: '127.0.0.1',
  pushPort: 60052,
  responseTimeout: 30000
};

exports['messenger/client:wmes-reports-2'] = {
  pubHost: '127.0.0.1',
  pubPort: 60060,
  repHost: '127.0.0.1',
  repPort: 60061,
  responseTimeout: 30000
};

exports.updater = {
  manifestPath: __dirname + '/wmes-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'wmes'
};

exports.reports = {
  messengerClientId: 'messenger/client:wmes-reports-1',
  messengerType: 'push',
  javaBatik: 'java -jar c:/tools/batik/batik-rasterizer.jar'
};

exports.xiconf = {
  zipStoragePath: DATA_PATH + '/xiconf-input',
  featureDbPath: DATA_PATH + '/xiconf-features'
};

exports.icpo = {
  zipStoragePath: DATA_PATH + '/icpo-input',
  fileStoragePath: DATA_PATH + '/icpo-files'
};

exports.warehouse = {
  importPath: DATA_PATH + '/attachments-input'
};
