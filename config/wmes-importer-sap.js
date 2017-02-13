'use strict';

var mongodb = require('./wmes-mongodb');

var IMPORT_INPUT_DIR = __dirname + '/../data/attachments-input';
var IMPORT_OUTPUT_DIR = __dirname + '/../data/attachments-imported';
var ETO_IMPORT_OUTPUT_DIR = __dirname + '/../data/documents-eto';

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
  'orders/importer/zlf1',
  'warehouse/importer/importQueue',
  'warehouse/importer/controlCycles',
  'warehouse/importer/transferOrders',
  'warehouse/importer/shiftMetrics',
  'xiconf/importer/orders',
  'orderDocuments/importer',
  'orderDocuments/importer/eto',
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
    'order', 'emptyOrder', 'orderIntake', 'orderZlf1',
    'mrpController', 'clipOrderCount',
    'fteLeaderEntry',
    'whControlCycleArchive', 'whControlCycle', 'whTransferOrder', 'whShiftMetrics',
    'xiconfOrder', 'xiconfHidLamp',
    'cag', 'cagPlan'
  ]
};

if (mongodb.server)
{
  mongodb.server.poolSize = 5;
}

if (mongodb.replSet)
{
  mongodb.replSet.poolSize = 5;
}

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
      'orders.zlf1.synced',
      'clipOrderCount.created',
      'warehouse.*.synced',
      'xiconf.orders.synced',
      'orderDocuments.synced',
      'orderDocuments.eto.synced',
      'cags.nc12.synced',
      'cags.plan.synced'
    ],
    error: [
      'orders.intake.syncFailed',
      'orders.bom.syncFailed',
      'orders.zlf1.syncFailed',
      'warehouse.*.syncFailed',
      'xiconf.orders.syncFailed',
      'orderDocuments.syncFailed',
      'orderDocuments.eto.syncFailed',
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
    'orders.synced', 'orders.intake.synced', 'orders.bom.synced', 'orders.zlf1.synced',
    'emptyOrders.synced',
    'warehouse.*.synced', 'warehouse.*.syncFailed', 'warehouse.shiftMetrics.updated',
    'xiconf.orders.synced',
    'orderDocuments.synced', 'orderDocuments.eto.synced',
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

exports['reports/clipOrderCount'] = {
  syncHour: 7
};

exports['warehouse/importer/transferOrders'] = {
  filterRe: /^WH_TRANSFER_ORDERS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['warehouse/importer/controlCycles'] = {
  filterRe: /^WH_CONTROL_CYCLES\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['xiconf/importer/orders'] = {
  filterRe: /^XICONF_ORDERS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/orders'] = {
  filterRe: /^(ORDERS(?:_OPERATIONS)?)\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR,
  orderDocumentsFilePathPattern: IMPORT_INPUT_DIR + '/{timestamp}@ORDERS_DOCUMENTS.txt'
};

exports['orderDocuments/importer'] = {
  filterRe: /^ORDERS_DOCUMENTS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR,
  xiconfProgramPatterns: [],
  xiconfProgramFilePathPattern: IMPORT_INPUT_DIR + '/{timestamp}@XICONF_ORDERS.txt'
};

exports['orderDocuments/importer/eto'] = {
  filterRe: /^EMAIL_[0-9]+$/,
  outputDir: ETO_IMPORT_OUTPUT_DIR,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/bom'] = {
  filterRe: /^ORDERS_COMPONENTS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/zlf1'] = {
  filterRe: /^ORDERS_ZLF1\.json$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/emptyOrders'] = {
  filterRe: /^(EMPTY_ORDERS(?:_OPERATIONS)?)\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/intake'] = {
  filterRe: /^ZOIN_([A-Z0-9]+)\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['cags/importer/nc12'] = {
  filterRe: /^MARA\.txt$/,
  resultFile: __dirname + '/../data/12nc_to_cags.json',
  parsedOutputDir: IMPORT_OUTPUT_DIR
};
