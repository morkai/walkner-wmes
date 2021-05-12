'use strict';

const frontend = require('./wmes-frontend');
const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

const IMPORT_INPUT_DIR = `${__dirname}/../data/attachments-input`;
const IMPORT_OUTPUT_DIR = `${__dirname}/../data/attachments-imported`;

exports.id = 'wmes-importer-sap';

Object.assign(exports, require('./wmes-common'));

exports.modules = [
  {id: 'h5-mongoose', name: 'mongoose'},
  {id: 'h5-mysql', name: 'mysql:ipt'},
  'events',
  'updater',
  'settings',
  'mail/sender',
  'messenger/server',
  'messenger/client',
  'directoryWatcher',
  'orders/importer/orders',
  'orders/importer/emptyOrders',
  'orders/importer/intake',
  'orders/importer/bom',
  'orders/importer/zlf1',
  'orders/importer/pkhd',
  'orders/importer/changeNumbers',
  'orders/iptChecker',
  'warehouse/importer/importQueue',
  'warehouse/importer/controlCycles',
  'warehouse/importer/transferOrders',
  'warehouse/importer/shiftMetrics',
  'xiconf/importer/orders',
  'orderDocuments/importer',
  'orderDocuments/importer/eto',
  'cags/importer/nc12',
  'cags/importer/plan',
  'kanban/importer'
];

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 5
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports['mysql:ipt'] = frontend['mysql:ipt'];

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 10000,
  versionsKey: 'wmes',
  backendVersionKey: 'importer-sap',
  frontendVersionKey: null
};

exports['mail/sender'] = {
  from: 'WMES Bot <wmes@localhost>'
};

exports['messenger/server'] = Object.assign({}, ports[exports.id], {
  broadcastTopics: [
    'events.saved',
    'settings.updated.**',
    'orders.synced', 'orders.*.synced',
    'orders.operationsChanged', 'orders.leadingOrdersChanged', 'orders.documentsChanged',
    'emptyOrders.synced',
    'warehouse.*.synced', 'warehouse.*.syncFailed', 'warehouse.shiftMetrics.updated',
    'xiconf.orders.synced',
    'orderDocuments.synced', 'orderDocuments.eto.synced', 'orderDocuments.missing.updated',
    'cags.plan.synced', 'cags.plan.syncFailed',
    'kanban.import.*',
    'old.wh.cancelQueue.updated',
    'compRel.entries.updated.*'
  ]
});

exports['messenger/client'] = Object.assign({}, ports['wmes-frontend'].client, {
  responseTimeout: 5000
});

exports.directoryWatcher = {
  path: IMPORT_INPUT_DIR
};

exports['reports/clipOrderCounter'] = {
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
  filterRe: /^(ORDERS(?:_OPERATIONS|_STATUSES)?)\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR,
  orderDocumentsFilePathPattern: `${IMPORT_INPUT_DIR}/{timestamp}@ORDERS_DOCUMENTS.txt`
};

exports['orderDocuments/importer'] = {
  filterRe: /^ORDERS_DOCUMENTS(_[0-9]+)?\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR,
  xiconfProgramPatterns: [],
  xiconfProgramFilePathPattern: `${IMPORT_INPUT_DIR}/{timestamp}@XICONF_ORDERS.txt`
};

exports['orderDocuments/importer/eto'] = {
  filterRe: /^EMAIL_[0-9]+$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/bom'] = {
  filterRe: /^ORDERS_COMPONENTS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR,
  xiconfFilePathPattern: exports['orderDocuments/importer'].xiconfProgramFilePathPattern
};

exports['orders/importer/changeNumbers'] = {
  filterRe: /^CHANGE_NUMBERS\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/zlf1'] = {
  filterRe: /^(ORDERS_ZLF1\.json|[0-9]{9}\.DAT)$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/importer/pkhd'] = {
  filterRe: /^PKHD_2\.txt$/,
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
  resultFile: `${__dirname}/../data/12nc_to_cags.json`,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['kanban/importer'] = {
  filterRe: /^KANBAN\.json$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['orders/iptChecker'] = {
  mysqlId: 'mysql:ipt'
};

exports['wmes-scrap/importer'] = {
  filterRe: /^SCRAP\.txt$/,
  parsedOutputDir: IMPORT_OUTPUT_DIR
};
