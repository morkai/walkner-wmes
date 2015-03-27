'use strict';

var IMPORT_INPUT_DIR = __dirname + '/../data/attachments-input';
var IMPORT_OUTPUT_DIR = __dirname + '/../data/attachments-imported';

exports.id = 'wmes-importer-sap';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'settings',
  'messenger/server',
  'messenger/client',
  'directoryWatcher',
  {id: 'orders/importer/orders', name: 'currentDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'nextDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'prevDayOrderImporter'},
  {id: 'orders/importer/emptyOrders', name: 'emptyOrderImporter'},
  'warehouse/importer/importQueue',
  'warehouse/importer/controlCycles',
  'warehouse/importer/transferOrders',
  'warehouse/importer/shiftMetrics',
  'xiconf/importer/orders',
  'reports/clipOrderCount'
];

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 5}
  },
  models: [
    'event',
    'setting',
    'order', 'emptyOrder',
    'mrpController', 'clipOrderCount',
    'fteLeaderEntry',
    'whControlCycleArchive', 'whControlCycle', 'whTransferOrder', 'whShiftMetrics',
    'xiconfOrder'
  ]
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started'
    ],
    info: [
      'events.**',
      'orders.synced',
      'emptyOrders.synced',
      'clipOrderCount.created',
      'warehouse.*.synced',
      'xiconf.orders.synced'
    ],
    error: [
      'warehouse.*.syncFailed',
      'xiconf.orders.syncFailed'
    ]
  }
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  versionsKey: 'wmes',
  backendVersionKey: 'importer-sap',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60020,
  repHost: '127.0.0.1',
  repPort: 60021,
  broadcastTopics: [
    'events.saved',
    'orders.synced',
    'emptyOrders.synced',
    'warehouse.*.synced', 'warehouse.*.syncFailed', 'warehouse.shiftMetrics.updated',
    'xiconf.orders.synced'
  ]
};

exports['messenger/client'] = {
  pubHost: '127.0.0.1',
  pubPort: 60000,
  repHost: '127.0.0.1',
  repPort: 60001,
  responseTimeout: 5000
};

exports.directoryWatcher = {
  path: IMPORT_INPUT_DIR
};

exports.currentDayOrderImporter = {
  orderStepCount: 8,
  operStepCount: 11,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports.nextDayOrderImporter = {
  orderStepCount: 8,
  operStepCount: 11,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO_2D, Step ([0-9]+)\.html?$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports.prevDayOrderImporter = {
  orderStepCount: 8,
  operStepCount: 11,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO_3D, Step ([0-9]+)\.html?$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports.emptyOrderImporter = {
  orderStepCount: 8,
  operStepCount: 11,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['reports/clipOrderCount'] = {
  importerId: 'currentDayOrderImporter',
  syncHour: 7
};

exports['warehouse/importer/controlCycles'] = {
  filterRe: /^T_LS41_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['warehouse/importer/transferOrders'] = {
  filterRe: /^T_LT23_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['xiconf/importer/orders'] = {
  filterRe: /^T_COOIS_XICONF_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};
