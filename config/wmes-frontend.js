'use strict';

const DATA_PATH = `${__dirname}/../data`;

const fs = require('fs');
const later = require('later');
const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

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
  'watchdog/memoryUsage',
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
  'reports/dailyMrpCount',
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
  'sapGui',
  'isaPalletKinds',
  'isa',
  'paintShop',
  'qi',
  'pscs',
  'd8',
  'heff',
  'vis',
  'mor',
  'planning',
  'wh',
  'html2pdf',
  'printing',
  'sapLaborTimeFixer',
  'kanban',
  'pfep',
  'xlsxExporter',
  {id: 'directoryWatcher', name: 'directoryWatcher:opinionSurveys'},
  'mail/sender',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-sap'},
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-results'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-1'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-2'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-3'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-4'},
  {id: 'messenger/client', name: 'messenger/client:wmes-watchdog'},
  {id: 'messenger/client', name: 'messenger/client:wmes-alerts'},
  {id: 'messenger/client', name: 'messenger/client:wmes-planning'},
  'httpServer',
  'sio'
];

exports.mainJsFile = '/wmes-main.js';
exports.mainCssFile = '/assets/wmes-main.css';
exports.faviconFile = 'assets/wmes-favicon.ico';

exports.frontendAppData = {
  KAIZEN_MULTI: false,
  XLSX_EXPORT: process.platform === 'win32',
  PRODUCTION_DATA_START_DATE: '2017-01-01',
  OFFICE365_TENANT: 'Microsoft',
  CORS_PING_URL: 'https://wmes.walkner.pl/ping'
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
      'd8.*.added', 'd8.*.edited',
      'kanban.supplyAreas.added', 'kanban.supplyAreas.edited',
      'kanban.containers.added', 'kanban.containers.edited'
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
      'opinionSurveys.*.deleted',
      'qi.*.deleted',
      'd8.*.deleted',
      'orderDocuments.tree.filePurged', 'orderDocuments.tree.folderPurged',
      'paintShop.paints.deleted',
      'kanban.supplyAreas.deleted',
      'kanban.containers.deleted',
      'pfep.entries.deleted'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [
    'pressWorksheets.added', 'pressWorksheets.edited',
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
  port: 80,
  availabilityTopics: ['orgUnits.rebuilt']
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: `${__dirname}/https.key`,
  cert: `${__dirname}/https.crt`,
  availabilityTopics: exports.httpServer.availabilityTopics
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
    'ping', 'sockets.connected', 'sockets.disconnected',
    'events.saved', 'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'shiftChanged',
    'fte.master.**', 'fte.leader.**',
    'hourlyPlans.created', 'hourlyPlans.updated.*',
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
    'paintShop.events.saved',
    'paintShop.orders.changed.*', 'paintShop.orders.updated.*',
    'paintShop.dropZones.updated.*', 'paintShop.paints.*',
    'paintShop.load.updated',
    'vis.**',
    'mor.**',
    'planning.**',
    'wh.**',
    'sapLaborTimeFixer.**',
    'printing.**',
    'kanban.**',
    'pfep.**'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: Object.assign(mongodb.mongoClient, {
    poolSize: 15
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user', 'passwordResetRequest', 'ping', 'printer',
    'division', 'subdivision', 'mrpController', 'workCenter', 'prodFlow', 'prodLine',
    'company', 'vendor', 'prodFunction', 'aor',
    'orderStatus', 'delayReason', 'downtimeReason', 'lossReason', 'prodTask',
    'order', 'mechOrder', 'emptyOrder', 'orderZlf1', 'invalidOrder',
    'orderDocumentClient', 'orderDocumentStatus', 'orderDocumentName',
    'orderDocumentFile', 'orderDocumentFolder', 'orderDocumentUpload',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan',
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
    'paintShopEvent', 'paintShopOrder', 'paintShopDropZone', 'paintShopPaint', 'paintShopLoad',
    'behaviorObsCard', 'minutesForSafetyCard',
    'visNodePosition',
    'planSettings', 'planChange', 'plan', 'whOrderStatus',
    'xData',
    'dailyMrpCount', 'clipOrderCache', 'clipOrderCount',
    'kanbanEntry', 'kanbanComponent', 'kanbanSupplyArea', 'kanbanContainer', 'kanbanTableView', 'kanbanPrintQueue',
    'whEvent', 'whOrder', 'whUser',
    'pkhdComponent', 'pkhdStrategy',
    'pfepEntry'
  ]
};

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
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  sessionCookieKey: 'wmes.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0
  },
  cookieSecret: '1ee7\\/\\/mes',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  textBody: {limit: '30mb'},
  jsonBody: {limit: '10mb'}
};

exports.user = {
  userInfoIdProperty: 'id',
  localAddresses: [/^192\.168\./, /^161\.87\./],
  privileges: [
    'SUPER',
    'USERS:VIEW', 'USERS:MANAGE',
    'ORDERS:VIEW', 'ORDERS:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'FTE:LEADER:VIEW', 'FTE:LEADER:MANAGE', 'FTE:LEADER:ALL',
    'FTE:MASTER:VIEW', 'FTE:MASTER:MANAGE', 'FTE:MASTER:ALL',
    'FTE:WH:VIEW', 'FTE:WH:MANAGE', 'FTE:WH:ALL',
    'HOURLY_PLANS:VIEW', 'HOURLY_PLANS:MANAGE', 'HOURLY_PLANS:ALL',
    'PROD_DOWNTIMES:VIEW', 'PROD_DOWNTIMES:MANAGE', 'PROD_DOWNTIMES:ALL',
    'PRESS_WORKSHEETS:VIEW', 'PRESS_WORKSHEETS:MANAGE',
    'PROD_DATA:VIEW', 'PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST', 'PROD_DATA:CHANGES:MANAGE',
    'PROD_DATA:MANAGE:SPIGOT_ONLY', 'PROD_DATA:VIEW:EFF',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW', 'REPORTS:MANAGE', 'REPORTS:1:VIEW', 'REPORTS:2:VIEW', 'REPORTS:3:VIEW', 'REPORTS:4:VIEW',
    'REPORTS:5:VIEW', 'REPORTS:6:VIEW', 'REPORTS:7:VIEW', 'REPORTS:8:VIEW', 'REPORTS:9:VIEW',
    'XICONF:VIEW', 'XICONF:MANAGE', 'XICONF:MANAGE:HID_LAMPS', 'XICONF:NOTIFY', 'ICPO:VIEW', 'ICPO:MANAGE',
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
    'MOR:MANAGE', 'MOR:MANAGE:USERS',
    'PAINT_SHOP:VIEW', 'PAINT_SHOP:MANAGE', 'PAINT_SHOP:PAINTER', 'PAINT_SHOP:DROP_ZONES',
    'PLANNING:VIEW', 'PLANNING:MANAGE', 'PLANNING:PLANNER', 'PLANNING:WHMAN',
    'KANBAN:VIEW', 'KANBAN:MANAGE', 'KANBAN:PRINT',
    'WH:VIEW', 'WH:MANAGE',
    'PFEP:VIEW', 'PFEP:MANAGE'
  ]
};

exports.users = {
  browsePrivileges: ['LOCAL', 'USER']
};

exports.production = {
  mysqlId: 'mysql:ipt'
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  responseTimeout: 5000,
  broadcastTopics: [
    'fte.leader.**',
    'shiftChanged'
  ]
});

exports['messenger/client:wmes-attachments'] = Object.assign({}, ports['wmes-attachments'], {
  responseTimeout: 5000
});

exports['messenger/client:wmes-importer-sap'] = Object.assign({}, ports['wmes-importer-sap'], {
  responseTimeout: 5000
});

exports['messenger/client:wmes-importer-results'] = Object.assign({}, ports['wmes-importer-results'], {
  responseTimeout: 5000
});

[1, 2, 3, 4].forEach(n =>
{
  exports[`messenger/client:wmes-reports-${n}`] = Object.assign({}, ports[`wmes-reports-${n}`].client, {
    responseTimeout: 4 * 60 * 1000 - 1000
  });
});

exports['messenger/client:wmes-watchdog'] = Object.assign({}, ports['wmes-watchdog'], {
  responseTimeout: 5000
});

exports['messenger/client:wmes-alerts'] = Object.assign({}, ports['wmes-alerts'], {
  responseTimeout: 5000
});

exports['messenger/client:wmes-planning'] = Object.assign({}, ports['wmes-planning'], {
  responseTimeout: 5000,
  broadcastTopics: [
    'planning.generator.requested',
    'paintShop.generator.requested',
    'wh.generator.requested',
    'settings.updated.orders.operations.groups',
    'settings.updated.wh.**'
  ]
});

exports.updater = {
  manifestPath: `${__dirname}/wmes-manifest.appcache`,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: `${__dirname}/../`,
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
    },
    {
      frontendVersionKey: 'ps-queue',
      path: '/ps-queue/manifest.appcache',
      mainJsFile: '/wmes-ps-queue.js',
      mainCssFile: '/assets/wmes-ps-queue.css',
      template: fs.readFileSync(`${__dirname}/wmes-manifest-ps.appcache`, 'utf8')
    },
    {
      frontendVersionKey: 'ps-load',
      path: '/ps-load/manifest.appcache',
      mainJsFile: '/wmes-ps-load.js',
      mainCssFile: '/assets/wmes-ps-load.css',
      template: fs.readFileSync(`${__dirname}/wmes-manifest-ps.appcache`, 'utf8')
    },
    {
      frontendVersionKey: 'wh-pickup',
      path: '/wh-pickup/manifest.appcache',
      mainJsFile: '/wmes-wh-pickup.js',
      mainCssFile: '/assets/wmes-wh-pickup.css',
      template: fs.readFileSync(`${__dirname}/wmes-manifest-wh.appcache`, 'utf8')
    },
    {
      frontendVersionKey: 'wh-kitter',
      path: '/wh-kitter/manifest.appcache',
      mainJsFile: '/wmes-wh-kitter.js',
      mainCssFile: '/assets/wmes-wh-kitter.css',
      template: fs.readFileSync(`${__dirname}/wmes-manifest-wh.appcache`, 'utf8')
    },
    {
      frontendVersionKey: 'wh-packer',
      path: '/wh-packer/manifest.appcache',
      mainJsFile: '/wmes-wh-packer.js',
      mainCssFile: '/assets/wmes-wh-packer.css',
      template: fs.readFileSync(`${__dirname}/wmes-manifest-wh.appcache`, 'utf8')
    }
  ]
};

exports.reports = {
  messengerClientId: 'messenger/client:wmes-reports-1',
  messengerType: 'push',
  javaBatik: 'java -jar c:/tools/batik/batik-rasterizer.jar',
  nc12ToCagsJsonPath: `${__dirname}/../data/12nc_to_cags.json`,
  reports: [
    'fte',
    '1', '2', 'clip', '3', '4', '5', '6', '7', '8', '9',
    'qi/count', 'qi/okRatio', 'qi/nokRatio',
    'kaizen/count', 'kaizen/summary', 'kaizen/metrics',
    'suggestions/count', 'suggestions/summary', 'suggestions/engagement',
    'opinionSurvey',
    'behaviorObsCards/count',
    'minutesForSafetyCards/count',
    'paintShop/load'
  ]
};

exports['reports/dailyMrpCount'] = {

};

exports.xiconf = {
  directoryWatcherId: null,
  zipStoragePath: `${DATA_PATH}/xiconf-input`,
  featureDbPath: `${DATA_PATH}/xiconf-features`,
  ordersImportPath: `${DATA_PATH}/attachments-input`,
  updatesPath: `${DATA_PATH}/xiconf-updates`
};

exports.icpo = {
  zipStoragePath: `${DATA_PATH}/icpo-input`,
  fileStoragePath: `${DATA_PATH}/icpo-files`
};

exports.warehouse = {
  importPath: `${DATA_PATH}/attachments-input`
};

exports['mail/sender'] = {
  from: 'WMES Bot <wmes@localhost>'
};

exports.kaizen = {
  attachmentsDest: `${DATA_PATH}/kaizen-attachments`,
  multiType: exports.frontendAppData.KAIZEN_MULTI
};

exports.suggestions = {
  attachmentsDest: `${DATA_PATH}/suggestions-attachments`
};

exports.qi = {
  attachmentsDest: `${DATA_PATH}/qi-attachments`
};

exports.orders = {
  importPath: `${DATA_PATH}/attachments-input`,
  iptCheckerClientId: 'messenger/client:wmes-importer-sap'
};

exports.d8 = {
  attachmentsDest: `${DATA_PATH}/d8-attachments`
};

exports.orderDocuments = {
  importPath: `${DATA_PATH}/attachments-input`,
  cachedPath: `${DATA_PATH}/order-documents/cached`,
  convertedPath: `${DATA_PATH}/order-documents/converted`,
  uploadedPath: `${DATA_PATH}/order-documents/uploaded`,
  etoPath: `${DATA_PATH}/order-documents/eto`,
  sejdaConsolePath: 'sejda-console'
};

exports.opinionSurveys = {
  directoryWatcherId: 'directoryWatcher:opinionSurveys',
  templatesPath: `${DATA_PATH}/opinion/templates`,
  surveysPath: `${DATA_PATH}/opinion/surveys`,
  inputPath: `${DATA_PATH}/opinion/input`,
  processingPath: `${DATA_PATH}/opinion/processing`,
  responsesPath: `${DATA_PATH}/opinion/responses`
};

exports['directoryWatcher:opinionSurveys'] = {
  path: exports.opinionSurveys.inputPath,
  delay: 30 * 1000,
  maxDelay: 120 * 1000
};

exports.paintShop = {
  generator: false,
  loadSecretKey: ''
};

exports.prodDowntimeAlerts = {
  messengerServerId: null,
  messengerClientId: 'messenger/client:wmes-alerts'
};

exports.cags = {
  planUploadPath: `${DATA_PATH}/attachments-input`
};

exports['sapGui/importer'] = {
  importPath: `${DATA_PATH}/attachments-input`,
  secretKey: ''
};

exports.sapGui = {
  expressId: null,
  mailSenderId: null,
  scriptsPath: null,
  remoteUrl: 'http://localhost/',
  secretKey: null
};

exports.mor = {
  statePath: `${DATA_PATH}/mor.json`
};

exports.planning = {
  generator: false
};

exports.wh = {
  generator: false
};

exports.html2pdf = {
  storagePath: `${DATA_PATH}/html2pdf/`
};

exports.sapLaborTimeFixer = {

};

exports.kanban = {
  sapImporterMessengerId: 'messenger/client:wmes-importer-sap'
};
