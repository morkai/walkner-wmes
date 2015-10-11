'use strict';

var mongodb = require('./wmes-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/]
  });
}
catch (err) {}

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
  'delayReasons',
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
  'prodChangeRequests',
  'reports',
  'xiconf',
  'warehouse',
  'licenses',
  'factoryLayout',
  'permalinks',
  'orderDocuments',
  'kaizen',
  'opinionSurveys',
  {id: 'directoryWatcher', name: 'directoryWatcher:opinionSurveys'},
  'mail/sender',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-sap'},
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-results'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-1'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-2'},
  {id: 'messenger/client', name: 'messenger/client:wmes-watchdog'},
  'httpServer',
  'sio'
];

exports.mainJsFile = '/wmes-main.js';
exports.mainCssFile = '/assets/wmes-main.css';
exports.faviconFile = 'assets/wmes-favicon.ico';

exports.frontendAppData = {
  KAIZEN_MULTI: false
};

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
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'kaizen.*.added', 'kaizen.*.edited',
      'opinionSurveys.*.added', 'opinionSurveys.*.edited'
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
      'production.lockFailure',
      'prodDowntimes.confirmedEdited',
      'kaizen.*.deleted',
      'opinionSurveys.*.deleted'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [
    'pressWorksheets.added',
    'kaizen.orders.added', 'kaizen.orders.edited',
    'opinionSurveys.responses.added',
    'opinionSurveys.omrResults.edited',
    'opinionSurveys.actions.added','opinionSurveys.actions.edited'
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
    'prodShifts.**', 'prodDowntimes.**', 'prodShiftOrders.**', 'prodChangeRequests.**',
    'updater.newVersion',
    'settings.updated.**',
    'xiconf.results.synced', 'xiconf.orders.**', 'xiconf.clients.**',
    'icpo.results.synced',
    'orders.updated.*',
    'orderDocuments.clients.**', 'orderDocuments.remoteChecked.*',
    'kaizen.*.added', 'kaizen.*.edited', 'kaizen.*.deleted', 'kaizen.orders.seen.*',
    'opinionSurveys.*.added', 'opinionSurveys.*.edited', 'opinionSurveys.*.deleted'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user', 'passwordResetRequest',
    'division', 'subdivision', 'mrpController', 'workCenter', 'prodFlow', 'prodLine',
    'company', 'vendor', 'prodFunction', 'aor',
    'orderStatus', 'delayReason', 'downtimeReason', 'lossReason', 'prodTask',
    'order', 'mechOrder', 'emptyOrder', 'clipOrderCount',
    'orderDocumentClient', 'orderDocumentStatus',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan',
    'prodLogEntry', 'prodShift', 'prodShiftOrder', 'prodDowntime', 'pressWorksheet', 'prodChangeRequest',
    'feedback',
    'license', 'licensePing',
    'xiconfOrderResult', 'xiconfResult', 'xiconfProgram', 'xiconfOrder', 'xiconfClient',
    'factoryLayout',
    'whTransferOrder',
    'kaizenSection', 'kaizenArea', 'kaizenCategory', 'kaizenCause', 'kaizenRisk', 'kaizenOrder',
    'opinionSurvey', 'opinionSurveyAction', 'opinionSurveyResponse',
    'opinionSurveyEmployer', 'opinionSurveyDivision', 'opinionSurveyQuestion',
    'opinionSurveyScanTemplate', 'opinionSurveyOmrResult'
  ]
};
exports.mongoose.options.server.poolSize = 15;

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
    'PROD_DATA:VIEW', 'PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST', 'PROD_DATA:CHANGES:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW', 'REPORTS:MANAGE', 'REPORTS:1:VIEW', 'REPORTS:2:VIEW', 'REPORTS:3:VIEW', 'REPORTS:4:VIEW',
    'REPORTS:5:VIEW', 'REPORTS:6:VIEW', 'REPORTS:7:VIEW',
    'XICONF:VIEW', 'XICONF:MANAGE', 'XICONF:NOTIFY', 'ICPO:VIEW', 'ICPO:MANAGE',
    'FACTORY_LAYOUT:MANAGE',
    'KAIZEN:MANAGE', 'KAIZEN:DICTIONARIES:VIEW', 'KAIZEN:DICTIONARIES:MANAGE',
    'OPERATOR:ACTIVATE',
    'DOCUMENTS:ACTIVATE', 'DOCUMENTS:VIEW', 'DOCUMENTS:MANAGE',
    'OPINION_SURVEYS:MANAGE'
  ]
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60000,
  repHost: '127.0.0.1',
  repPort: 60001,
  responseTimeout: 5000,
  broadcastTopics: [
    'fte.leader.**'
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
  responseTimeout: 4 * 60 * 1000 - 1000
};

exports['messenger/client:wmes-reports-2'] = {
  pubHost: '127.0.0.1',
  pubPort: 60060,
  repHost: '127.0.0.1',
  repPort: 60061,
  responseTimeout: 4 * 60 * 1000 - 1000
};

exports['messenger/client:wmes-watchdog'] = {
  pubHost: '127.0.0.1',
  pubPort: 60070,
  repHost: '127.0.0.1',
  repPort: 60071,
  responseTimeout: 5000
};

exports.updater = {
  manifestPath: __dirname + '/wmes-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'wmes',
  manifests: [
    {
      path: '/manifest.appcache',
      mainJsFile: exports.mainJsFile,
      mainCssFile: exports.mainCssFile
    },
    {
      path: '/orderDocuments/manifest.appcache',
      mainJsFile: '/wmes-docs.js',
      mainCssFile: '/assets/wmes-docs.css'
    }
  ]
};

exports.reports = {
  messengerClientId: 'messenger/client:wmes-reports-1',
  messengerType: 'push',
  javaBatik: 'java -jar c:/tools/batik/batik-rasterizer.jar'
};

exports.xiconf = {
  directoryWatcherId: null,
  zipStoragePath: DATA_PATH + '/xiconf-input',
  featureDbPath: DATA_PATH + '/xiconf-features',
  ordersImportPath: DATA_PATH + '/attachments-input',
  updatesPath: DATA_PATH + '/xiconf-updates'
};

exports.icpo = {
  zipStoragePath: DATA_PATH + '/icpo-input',
  fileStoragePath: DATA_PATH + '/icpo-files'
};

exports.warehouse = {
  importPath: DATA_PATH + '/attachments-input'
};

exports['mail/sender'] = {
  from: 'WMES Bot <wmes@localhost>'
};

exports.kaizen = {
  attachmentsDest: DATA_PATH + '/kaizen-attachments',
  multiType: exports.frontendAppData.KAIZEN_MULTI
};

exports.orders = {
  importPath: DATA_PATH + '/attachments-input'
};

exports.orderDocuments = {
  importPath: DATA_PATH + '/attachments-input',
  cachedPath: DATA_PATH + '/documents-cache',
  sejdaConsolePath: 'sejda-console'
};

exports.opinionSurveys = {
  directoryWatcherId: 'directoryWatcher:opinionSurveys',
  templatesPath: DATA_PATH + '/opinion/templates',
  surveysPath: DATA_PATH + '/opinion/surveys',
  inputPath: DATA_PATH + '/opinion/input',
  processingPath: DATA_PATH + '/opinion/processing',
  responsesPath: DATA_PATH + '/opinion/responses'
};

exports['directoryWatcher:opinionSurveys'] = {
  path: exports.opinionSurveys.inputPath,
  delay: 30 * 1000,
  maxDelay: 120 * 1000
};
