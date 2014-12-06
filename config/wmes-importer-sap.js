'use strict';

var IMPORT_INPUT_DIR = __dirname + '/../data/attachments-input';
var IMPORT_OUTPUT_DIR = __dirname + '/../data/attachments-imported';

exports.id = 'wmes-importer-sap';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'directoryWatcher',
  {id: 'orders/importer/orders', name: 'currentDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'nextDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'prevDayOrderImporter'},
  {id: 'orders/importer/emptyOrders', name: 'emptyOrderImporter'},
  'warehouse/importer/controlCycles',
  'warehouse/importer/transferOrders',
  'reports/clipOrderCount'
];

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
      'clipOrderCount.created'
    ]
  }
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./wmes-mongodb').uri,
  options: {
    server: {poolSize: 5}
  },
  models: ['event', 'order', 'emptyOrder', 'clipOrderCount', 'whControlCycleArchive', 'whTransferOrderArchive']
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60020,
  repHost: '127.0.0.1',
  repPort: 60021,
  broadcastTopics: [
    'events.saved',
    'orders.synced',
    'emptyOrders.synced'
  ]
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
  importerId: 'currentDayOrderImporter'
};

exports['warehouse/importer/controlCycles'] = {
  parsedOutputDir: IMPORT_OUTPUT_DIR
};

exports['warehouse/importer/transferOrders'] = {
  parsedOutputDir: IMPORT_OUTPUT_DIR
};
