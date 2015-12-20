'use strict';

var mongodb = require('./wmes-mongodb');

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
  'orders/importer/orders',
  'orders/importer/emptyOrders',
  'orders/importer/intake',
  'orders/importer/bom',
  'warehouse/importer/importQueue',
  'warehouse/importer/controlCycles',
  'warehouse/importer/transferOrders',
  'warehouse/importer/shiftMetrics',
  'xiconf/importer/orders',
  'orderDocuments/importer',
  'reports/clipOrderCount',
  'cags/importer/nc12',
  'cags/importer/plan'
];

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event',
    'setting',
    'order', 'emptyOrder', 'orderIntake',
    'mrpController', 'clipOrderCount',
    'fteLeaderEntry',
    'whControlCycleArchive', 'whControlCycle', 'whTransferOrder', 'whShiftMetrics',
    'xiconfOrder',
    'cag', 'cagPlan'
  ]
};
exports.mongoose.options.server.poolSize = 5;

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**',
      'orders.synced',
      'emptyOrders.synced',
      'orders.intake.synced',
      'orders.bom.synced',
      'clipOrderCount.created',
      'warehouse.*.synced',
      'xiconf.orders.synced',
      'orderDocuments.synced',
      'cags.nc12.synced',
      'cags.plan.synced'
    ],
    error: [
      'orders.intake.syncFailed',
      'orders.bom.syncFailed',
      'warehouse.*.syncFailed',
      'xiconf.orders.syncFailed',
      'orderDocuments.syncFailed',
      'cags.nc12.syncFailed',
      'cags.plan.syncFailed',
      'app.started'
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
    'orders.synced', 'orders.intake.synced', 'orders.bom.synced',
    'emptyOrders.synced',
    'warehouse.*.synced', 'warehouse.*.syncFailed', 'warehouse.shiftMetrics.updated',
    'xiconf.orders.synced',
    'orderDocuments.synced',
    'cags.plan.synced', 'cags.plan.syncFailed'
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

exports['orders/importer/orders'] = {
  filterRe: /^T_COOIS_(ORDERS|OPERS)_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/emptyOrders'] = {
  filterRe: /^T_COOIS_EMPTY_(ORDERS|OPERS)_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/intake'] = {
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/bom'] = {
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['reports/clipOrderCount'] = {
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

exports['orderDocuments/importer'] = {
  filterRe: /^T_COOIS_DOCS_[0-9]+\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['cags/importer/nc12'] = {
  resultFile: __dirname + '/../data/12nc_to_cags.json',
  parsedOutputDir: IMPORT_OUTPUT_DIR
};
