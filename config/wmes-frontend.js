'use strict';

const ROOT_PATH = `${__dirname}/..`;
const DATA_PATH = `${ROOT_PATH}/data`;
const KAIZEN_MULTI = false;

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

Object.assign(exports, require('./wmes-common'));

exports.modules = [
  'watchdog/memoryUsage',
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  {id: 'h5-mysql', name: 'mysql:ipt'},
  'settings',
  'events',
  'pubsub',
  'user',
  'pings',
  {id: 'h5-express', name: 'express'},
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
  'reports/dailyMrpCounter',
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
  'orderBomMatchers',
  'subscriptions',
  'help',
  'logs',
  'wmes-toolcal',
  'wmes-fap',
  'wmes-luma2-frontend',
  'wmes-snf',
  'wmes-trw',
  'wmes-luca-frontend',
  'wmes-drilling',
  'wmes-wiring',
  'wmes-ct-frontend',
  'wmes-clients',
  {id: 'directoryWatcher', name: 'directoryWatcher:opinionSurveys'},
  'mail/sender',
  'sms/sender',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-sap'},
  {id: 'messenger/client', name: 'messenger/client:wmes-importer-results'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-1'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-2'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-3'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-4'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-5'},
  {id: 'messenger/client', name: 'messenger/client:wmes-reports-6'},
  {id: 'messenger/client', name: 'messenger/client:wmes-watchdog'},
  {id: 'messenger/client', name: 'messenger/client:wmes-alerts'},
  {id: 'messenger/client', name: 'messenger/client:wmes-planning'},
  {id: 'messenger/client', name: 'messenger/client:wmes-luma2'},
  {id: 'messenger/client', name: 'messenger/client:wmes-luca'},
  {id: 'messenger/client', name: 'messenger/client:wmes-ct'},
  'httpServer',
  'sio'
];

const manifestTemplates = {
  main: fs.readFileSync(`${ROOT_PATH}/config/wmes-manifest.appcache`, 'utf8'),
  ps: fs.readFileSync(`${ROOT_PATH}/config/wmes-manifest-ps.appcache`, 'utf8'),
  wh: fs.readFileSync(`${ROOT_PATH}/config/wmes-manifest-wh.appcache`, 'utf8')
};
const frontendDictionaryModules = {
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
const whDictionaryModules = {
  downtimeReasons: 'DOWNTIME_REASONS',
  orderStatuses: 'ORDER_STATUSES'
};

exports.updater = {
  manifestPath: `${ROOT_PATH}/config/wmes-manifest.appcache`,
  packageJsonPath: `${ROOT_PATH}/package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: ROOT_PATH,
    timeout: 30000
  },
  versionsKey: 'wmes',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: '/manifest.appcache',
      mainJsFile: '/wmes-main.js',
      mainCssFile: '/assets/wmes-main.css',
      template: manifestTemplates.main,
      frontendAppData: {
        KAIZEN_MULTI,
        XLSX_EXPORT: process.platform === 'win32',
        PRODUCTION_DATA_START_DATE: exports.productionDataStartDate,
        SHIFT_START_HOUR: 6,
        SHIFT_LENGTH: 8,
        OFFICE365_TENANT: 'Microsoft',
        CORS_PING_URL: 'https://test.wmes.pl/ping',
        SERVICE_WORKER: '/sw.js',
        NAVBAR_ITEMS: {
          fixedAssets: true,
          invalidOrders: true,
          iptCheck: true
        }
      },
      dictionaryModules: frontendDictionaryModules
    },
    {
      frontendVersionKey: 'docs',
      path: '/orderDocuments/manifest.appcache',
      mainJsFile: '/wmes-docs.js',
      mainCssFile: '/assets/wmes-docs.css',
      template: manifestTemplates.main,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'operator',
      path: '/operator/manifest.appcache',
      mainJsFile: '/wmes-operator.js',
      mainCssFile: '/assets/wmes-operator.css',
      template: manifestTemplates.main,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'heff',
      path: '/heff/manifest.appcache',
      mainJsFile: '/wmes-heff.js',
      mainCssFile: '/assets/wmes-heff.css',
      template: manifestTemplates.main,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'drilling',
      path: '/drilling/manifest.appcache',
      mainJsFile: '/wmes-drilling.js',
      mainCssFile: '/assets/wmes-drilling.css',
      template: manifestTemplates.ps,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'wiring',
      path: '/wiring/manifest.appcache',
      mainJsFile: '/wmes-wiring.js',
      mainCssFile: '/assets/wmes-wiring.css',
      template: manifestTemplates.ps,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'ps-queue',
      path: '/ps-queue/manifest.appcache',
      mainJsFile: '/wmes-ps-queue.js',
      mainCssFile: '/assets/wmes-ps-queue.css',
      template: manifestTemplates.ps,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'ps-load',
      path: '/ps-load/manifest.appcache',
      mainJsFile: '/wmes-ps-load.js',
      mainCssFile: '/assets/wmes-ps-load.css',
      template: manifestTemplates.ps,
      frontendAppData: {},
      dictionaryModules: {}
    },
    {
      frontendVersionKey: 'wh-pickup',
      path: '/wh-pickup/manifest.appcache',
      mainJsFile: '/wmes-wh-pickup.js',
      mainCssFile: '/assets/wmes-wh-pickup.css',
      template: manifestTemplates.wh,
      frontendAppData: {},
      dictionaryModules: whDictionaryModules
    },
    {
      frontendVersionKey: 'wh-problems',
      path: '/wh-problems/manifest.appcache',
      mainJsFile: '/wmes-wh-problems.js',
      mainCssFile: '/assets/wmes-wh-problems.css',
      template: manifestTemplates.wh,
      frontendAppData: {},
      dictionaryModules: whDictionaryModules
    },
    {
      frontendVersionKey: 'wh-delivery-components',
      path: '/wh-delivery-components/manifest.appcache',
      mainJsFile: '/wmes-wh-delivery-components.js',
      mainCssFile: '/assets/wmes-wh-delivery-components.css',
      template: manifestTemplates.wh,
      frontendAppData: {},
      dictionaryModules: whDictionaryModules
    },
    {
      frontendVersionKey: 'wh-delivery-packaging',
      path: '/wh-delivery-packaging/manifest.appcache',
      mainJsFile: '/wmes-wh-delivery-packaging.js',
      mainCssFile: '/assets/wmes-wh-delivery-packaging.css',
      template: manifestTemplates.wh,
      frontendAppData: {},
      dictionaryModules: whDictionaryModules
    },
    {
      frontendVersionKey: 'isa',
      path: '/isa/manifest.appcache',
      mainJsFile: '/wmes-isa.js',
      mainCssFile: '/assets/wmes-isa.css',
      template: manifestTemplates.main,
      frontendAppData: {},
      dictionaryModules: {
        divisions: 'DIVISIONS',
        subdivisions: 'SUBDIVISIONS',
        mrpControllers: 'MRP_CONTROLLERS',
        prodFlows: 'PROD_FLOWS',
        workCenters: 'WORK_CENTERS',
        prodLines: 'PROD_LINES',
        isaPalletKinds: 'ISA_PALLET_KINDS'
      }
    },
    {
      frontendVersionKey: 'trw',
      path: '/trw/manifest.appcache',
      mainJsFile: '/wmes-trw.js',
      mainCssFile: '/assets/wmes-trw.css',
      template: manifestTemplates.main,
      frontendAppData: {},
      dictionaryModules: {}
    }
  ]
};

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
  insertDelay: 1000,
  topics: {
    debug: [
      '*.added', '*.edited'
    ],
    warning: [
      '*.deleted'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [

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
  key: `${ROOT_PATH}/config/https.key`,
  cert: `${ROOT_PATH}/config/https.crt`,
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
    'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 15
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
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
  staticPath: `${ROOT_PATH}/frontend`,
  staticBuildPath: `${ROOT_PATH}/frontend-build`,
  sessionCookieKey: 'wmes.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: false
  },
  cookieSecret: '1ee7\\/\\/mes',
  ejsAmdHelpers: {
    _: 'underscore',
    $: 'jquery',
    t: 'app/i18n',
    time: 'app/time',
    user: 'app/user',
    forms: 'app/core/util/forms'
  },
  textBody: {limit: '30mb'},
  jsonBody: {limit: '10mb'},
  routes: [
    require('../backend/routes/core'),
    require('../backend/routes/fix')
  ]
};

exports.user = {
  userInfoIdProperty: 'id',
  localAddresses: [/^192\.168\./, /^161\.87\./],
  privileges: [
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE'
  ]
};

exports.users = {
  browsePrivileges: ['LOCAL', 'USER'],
  loginIn: {},
  loginAs: {}
};

exports.production = {
  mysqlId: 'mysql:ipt',
  dictionaryModules: frontendDictionaryModules
};

exports['messenger/server'] = Object.assign({}, ports[exports.id].server, {
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

[1, 2, 3, 4, 5, 6].forEach(n =>
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
    'orders.synced',
    'planning.generator.requested',
    'paintShop.generator.requested',
    'drilling.generator.requested',
    'wiring.generator.requested',
    'old.wh.generator.requested',
    'wh.generator.requested',
    'settings.updated.orders.operations.groups',
    'settings.updated.wh.**'
  ]
});

exports['messenger/client:wmes-luma2'] = Object.assign({}, ports['wmes-luma2'], {
  responseTimeout: 5000,
  broadcastTopics: [
    'luma2.lines.*'
  ]
});

exports['messenger/client:wmes-luca'] = Object.assign({}, ports['wmes-luca'], {
  responseTimeout: 5000,
  broadcastTopics: [
    'luca.orderChanged',
    'luca.kanbanChanged'
  ]
});

exports['messenger/client:wmes-ct'] = Object.assign({}, ports['wmes-ct'], {
  responseTimeout: 5000,
  broadcastTopics: [
    'ct.lines.*',
    'ct.downtimeReasonUpdated',
    'ct.todos.saved'
  ]
});

exports.reports = {
  messengerClientId: 'messenger/client:wmes-reports-1',
  messengerType: 'push',
  javaBatik: 'java -jar c:/tools/batik/batik-rasterizer.jar',
  nc12ToCagsJsonPath: `${DATA_PATH}/12nc_to_cags.json`,
  reports: require('./wmes-reports')
};

exports['reports/dailyMrpCounter'] = {

};

exports.xiconf = {
  directoryWatcherId: null,
  zipStoragePath: `${DATA_PATH}/xiconf-input`,
  featureDbPath: `${DATA_PATH}/xiconf-features`,
  ordersImportPath: `${DATA_PATH}/attachments-input`,
  updatesPath: `${DATA_PATH}/xiconf-updates`

};

exports['wmes-snf'] = {
  snfImagesPath: `${DATA_PATH}/uploads/snf`
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

exports['sms/sender'] = {

};

exports.kaizen = {
  attachmentsDest: `${DATA_PATH}/kaizen-attachments`,
  multiType: KAIZEN_MULTI
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

exports.paintShop = {
  generator: false,
  loadSecretKey: ''
};

exports['wmes-drilling'] = {
  generator: false
};

exports['wmes-wiring'] = {
  generator: false
};

exports.wh = {
  generator: false
};

exports['wmes-wh'] = {
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

exports.help = {
  gdriveId: null,
  dataPath: `${DATA_PATH}/help`
};

exports['wmes-fap'] = {

};

exports['wmes-luca-frontend'] = {
  messengerClientId: 'messenger/client:wmes-luca'
};

exports['wmes-ct-frontend'] = {
  messengerClientId: 'messenger/client:wmes-ct'
};
