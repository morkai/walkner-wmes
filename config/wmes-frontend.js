'use strict';

const DATA_PATH = __dirname + '/../data';

const mongodb = require('./wmes-mongodb');
const later = require('later');

later.date.localTime();

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/] // eslint-disable-line camelcase
  });
}
catch (err) {} // eslint-disable-line no-empty

exports.id = 'wmes-frontend';

exports.modules = [
  'updater',
  'mongoose',
  {id: 'mysql', name: 'mysql:ipt'},
  'settings',
  'events',
  'pubsub',
  'user',
  'pings',
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
  'prodDowntimeAlerts',
  'prodSerialNumbers',
  'reports',
  'xiconf',
  'warehouse',
  'licenses',
  'factoryLayout',
  'permalinks',
  'orderDocuments',
  'kaizen',
  'suggestions',
  'behaviorObsCards',
  'minutesForSafetyCards',
  'opinionSurveys',
  'cags',
  'sapGui/importer',
  'isaPalletKinds',
  'isa',
  'paintShop',
  'qi',
  'pscs',
  'd8',
  'heff',
  'vis',
  'mor',
  {id: 'directoryWatcher', name: 'directoryWatcher:opinionSurveys'},
  {id: 'directoryWatcher', name: 'directoryWatcher:paintShop'},
  'mail/sender',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-sap'},
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-results'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-1'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-2'},
  {id: 'messenger/client', name: 'messenger/client:wmes-watchdog'},
  {id: 'messenger/client', name: 'messenger/client:wmes-alerts'},
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
  downtimeReasons: 'DOWNTIME_REASONS',
  isaPalletKinds: 'ISA_PALLET_KINDS'
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'users.login', 'users.logout',
      '*.added', '*.edited',
      'kaizen.*.added', 'kaizen.*.edited',
      'opinionSurveys.*.added', 'opinionSurveys.*.edited',
      'qi.*.added', 'qi.*.edited',
      'd8.*.added', 'd8.*.edited'
    ],
    info: [
      'events.**',
      'mechOrders.synced',
      'users.synced',
      'production.unlocked',
      'production.locked',
      'paintShop.orders.imported'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'fte.leader.deleted', 'fte.master.deleted',
      'production.unlockFailure',
      'production.lockFailure',
      'prodDowntimes.confirmedEdited',
      'kaizen.*.deleted',
      'opinionSurveys.*.deleted',
      'qi.*.deleted',
      'd8.*.deleted',
      'orderDocuments.tree.filePurged', 'orderDocuments.tree.folderPurged'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [
    'pressWorksheets.added',
    'kaizen.orders.added', 'kaizen.orders.edited',
    'suggestions.added', 'suggestions.edited',
    'opinionSurveys.responses.added',
    'opinionSurveys.omrResults.edited',
    'opinionSurveys.actions.added', 'opinionSurveys.actions.edited',
    'prodDowntimeAlerts.added',
    'qi.results.added', 'qi.results.edited',
    'd8.entries.added', 'd8.entries.edited',
    'heffLineStates.added', 'heffLineStates.edited', 'heffLineStates.deleted',
    'behaviorObsCards.added', 'behaviorObsCards.edited',
    'minutesForSafetyCards.added', 'minutesForSafetyCards.edited'
  ]
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: __dirname + '/https.key',
  cert: __dirname + '/https.crt'
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'events.saved', 'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'shiftChanged',
    'fte.master.**', 'fte.leader.**',
    'hourlyPlans.created', 'hourlyPlans.updated.*', 'dailyMrpPlans.**',
    'users.syncFailed', 'users.presence.updated',
    'production.synced.**', 'production.edited.**', 'production.stateChanged.**', 'production.autoDowntimes.**',
    'production.taktTime.snChecked.**',
    'prodShifts.**', 'prodDowntimes.**', 'prodShiftOrders.**', 'prodChangeRequests.**', 'prodSerialNumbers.created.**',
    'updater.newVersion',
    'settings.updated.**',
    'xiconf.results.**', 'xiconf.orders.**', 'xiconf.clients.**',
    'icpo.results.synced', 'orders.intake.synced',
    'orders.updated.*', 'orders.quantityDone.*', 'orders.invalid.**',
    'orderDocuments.tree.**', 'orderDocuments.clients.**', 'orderDocuments.remoteChecked.*',
    'orderDocuments.eto.synced',
    'kaizen.*.added', 'kaizen.*.edited', 'kaizen.*.deleted', 'kaizen.orders.seen.*',
    'suggestions.seen.*',
    'opinionSurveys.*.added', 'opinionSurveys.*.edited', 'opinionSurveys.*.deleted',
    'cags.nc12.synced', 'cags.nc12.syncFailed', 'cags.plan.synced', 'cags.plan.syncFailed',
    'isaRequests.**', 'isaEvents.saved', 'isaShiftPersonnel.updated',
    'qi.**',
    'pscs.**',
    'd8.**',
    'heff.**',
    'ping', 'sockets.connected', 'sockets.disconnected',
    'paintShop.orders.imported', 'paintShop.orders.updated.**',
    'vis.**',
    'mor.**'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user', 'passwordResetRequest', 'ping',
    'division', 'subdivision', 'mrpController', 'workCenter', 'prodFlow', 'prodLine',
    'company', 'vendor', 'prodFunction', 'aor',
    'orderStatus', 'delayReason', 'downtimeReason', 'lossReason', 'prodTask',
    'order', 'mechOrder', 'emptyOrder', 'clipOrderCount', 'orderZlf1', 'invalidOrder',
    'orderDocumentClient', 'orderDocumentStatus', 'orderDocumentName',
    'orderDocumentFile', 'orderDocumentFolder', 'orderDocumentUpload',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan', 'dailyMrpPlan',
    'prodLogEntry', 'prodShift', 'prodShiftOrder', 'prodDowntime', 'pressWorksheet', 'prodChangeRequest',
    'prodDowntimeAlert', 'prodSerialNumber',
    'feedback',
    'license', 'licensePing',
    'xiconfOrderResult', 'xiconfResult', 'xiconfClient', 'xiconfClientSettings',
    'xiconfOrder', 'xiconfProgram', 'xiconfInvalidLed', 'xiconfHidLamp', 'xiconfComponentWeight',
    'factoryLayout',
    'whTransferOrder',
    'kaizenSection', 'kaizenArea', 'kaizenCategory', 'kaizenCause', 'kaizenRisk',
    'kaizenProductFamily', 'kaizenBehaviour', 'kaizenOrder',
    'suggestion',
    'opinionSurvey', 'opinionSurveyAction', 'opinionSurveyResponse',
    'opinionSurveyEmployer', 'opinionSurveyDivision', 'opinionSurveyQuestion',
    'opinionSurveyScanTemplate', 'opinionSurveyOmrResult',
    'cag', 'cagGroup', 'cagPlan',
    'isaPalletKind', 'isaEvent', 'isaRequest', 'isaShiftPersonnel',
    'qiKind', 'qiErrorCategory', 'qiFault', 'qiActionStatus', 'qiResult',
    'pscsResult',
    'd8Entry', 'd8Area', 'd8EntrySource', 'd8ProblemSource',
    'heffLineState',
    'paintShopOrder',
    'behaviorObsCard', 'minutesForSafetyCard',
    'visNodePosition'
  ]
};

if (mongodb.server)
{
  mongodb.server.poolSize = 15;
}

if (mongodb.replSet)
{
  mongodb.replSet.poolSize = 15;
}

exports['mysql:ipt'] = {
  connection: {
    host: '127.0.0.1',
    port: 3306,
    database: 'ipt',
    connectTimeout: 2000,
    acquireTimeout: 4000,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  }
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'wmes.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 3600 * 8 * 1000,
    touchChance: 0
  },
  cookieSecret: '1ee7\\/\\/mes',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  textBody: {limit: '15mb'},
  jsonBody: {limit: '4mb'}
};

exports.user = {
  localAddresses: [/^192\.168\./, /^161\.87\./],
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
    'REPORTS:5:VIEW', 'REPORTS:6:VIEW', 'REPORTS:7:VIEW', 'REPORTS:8:VIEW', 'REPORTS:9:VIEW',
    'XICONF:VIEW', 'XICONF:MANAGE', 'XICONF:NOTIFY', 'ICPO:VIEW', 'ICPO:MANAGE',
    'FACTORY_LAYOUT:MANAGE',
    'KAIZEN:MANAGE', 'KAIZEN:DICTIONARIES:VIEW', 'KAIZEN:DICTIONARIES:MANAGE',
    'SUGGESTIONS:MANAGE',
    'OPERATOR:ACTIVATE',
    'DOCUMENTS:ACTIVATE', 'DOCUMENTS:VIEW', 'DOCUMENTS:MANAGE',
    'OPINION_SURVEYS:MANAGE',
    'PROD_DOWNTIME_ALERTS:VIEW', 'PROD_DOWNTIME_ALERTS:MANAGE',
    'ISA:VIEW', 'ISA:MANAGE', 'ISA:WHMAN',
    'QI:INSPECTOR', 'QI:SPECIALIST',
    'QI:RESULTS:VIEW', 'QI:RESULTS:MANAGE',
    'QI:DICTIONARIES:VIEW', 'QI:DICTIONARIES:MANAGE',
    'PSCS:VIEW', 'PSCS:MANAGE',
    'D8:VIEW', 'D8:MANAGE', 'D8:LEADER', 'D8:DICTIONARIES:VIEW', 'D8:DICTIONARIES:MANAGE',
    'MOR:MANAGE', 'MOR:MANAGE:USERS'
  ]
};

exports.users = {
  browsePrivileges: ['LOCAL', 'USER']
};

exports.production = {
  mysqlId: 'mysql:ipt'
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

exports['messenger/client:wmes-alerts'] = {
  pubHost: '127.0.0.1',
  pubPort: 60080,
  repHost: '127.0.0.1',
  repPort: 60081,
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
      frontendVersionKey: 'docs',
      path: '/orderDocuments/manifest.appcache',
      mainJsFile: '/wmes-docs.js',
      mainCssFile: '/assets/wmes-docs.css'
    },
    {
      frontendVersionKey: 'operator',
      path: '/operator/manifest.appcache',
      mainJsFile: '/wmes-operator.js',
      mainCssFile: '/assets/wmes-operator.css'
    },
    {
      frontendVersionKey: 'heff',
      path: '/heff/manifest.appcache',
      mainJsFile: '/wmes-heff.js',
      mainCssFile: '/assets/wmes-heff.css'
    }
  ]
};

exports.reports = {
  messengerClientId: 'messenger/client:wmes-reports-1',
  messengerType: 'push',
  javaBatik: 'java -jar c:/tools/batik/batik-rasterizer.jar',
  nc12ToCagsJsonPath: __dirname + '/../data/12nc_to_cags.json',
  reports: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'qi/count', 'qi/okRatio', 'qi/nokRatio'
  ]
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

exports.suggestions = {
  attachmentsDest: DATA_PATH + '/suggestions-attachments'
};

exports.qi = {
  attachmentsDest: DATA_PATH + '/qi-attachments'
};

exports.orders = {
  importPath: DATA_PATH + '/attachments-input',
  iptCheckerClientId: 'messenger/client:wmes-importer-sap'
};

exports.d8 = {
  attachmentsDest: DATA_PATH + '/d8-attachments'
};

exports.orderDocuments = {
  importPath: DATA_PATH + '/attachments-input',
  cachedPath: DATA_PATH + '/order-documents/cached',
  convertedPath: DATA_PATH + '/order-documents/converted',
  uploadedPath: DATA_PATH + '/order-documents/uploaded',
  etoPath: DATA_PATH + '/order-documents/eto',
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

exports['directoryWatcher:paintShop'] = {
  path: DATA_PATH + '/paintshop'
};

exports.paintShop = {
  directoryWatcherId: 'directoryWatcher:paintShop'
};

exports.prodDowntimeAlerts = {
  messengerServerId: null,
  messengerClientId: 'messenger/client:wmes-alerts'
};

exports.cags = {
  planUploadPath: DATA_PATH + '/attachments-input'
};

exports['sapGui/importer'] = {
  importPath: DATA_PATH + '/attachments-input',
  secretKey: ''
};

exports.mor = {
  statePath: DATA_PATH + '/mor.json'
};
