'use strict';

exports.id = 'importer';

exports.modules = [
  'mongoose',
  'events',
  'messenger/server',
  'directoryWatcher',
  {id: 'orders/importer/orders', name: 'currentDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'nextDayOrderImporter'},
  {id: 'orders/importer/orders', name: 'prevDayOrderImporter'},
  {id: 'orders/importer/emptyOrders', name: 'emptyOrderImporter'}
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
      'emptyOrders.synced'
    ]
  }
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {
    server: {poolSize: 5}
  }
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
  path: __dirname + '/../data/attachments'
};

exports.currentDayOrderImporter = {
  stepCount: 10
};

exports.nextDayOrderImporter = {
  stepCount: 10,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO_2D, Step ([0-9]+)\.html?$/
};

exports.prevDayOrderImporter = {
  stepCount: 10,
  filterRe: /^Job PL02_(ORDER|OPER)_INFO_3D, Step ([0-9]+)\.html?$/
};

exports.emptyOrderImporter = {
  stepCount: 10
};
