'use strict';

var mongodb = require('./wmes-mongodb');

exports.id = 'wmes-reports-1';

exports.modules = [
  'mongoose',
  'events',
  'updater',
  'messenger/server',
  'reports/server'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
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

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event',
    'prodShift', 'prodShiftOrder', 'prodDowntime',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan',
    'clipOrderCount',
    'whShiftMetrics',
    'cag', 'cagGroup', 'cagPlan',
    'qiResult'
  ]
};

if (mongodb.server)
{
  mongodb.server.poolSize = 10;
}

if (mongodb.replSet)
{
  mongodb.replSet.poolSize = 10;
  mongodb.db.readPreference = 'secondaryPreferred';
}

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'reports',
  frontendVersionKey: null
};

exports['messenger/server'] = {
  pubHost: '127.0.0.1',
  pubPort: 60050,
  repHost: '127.0.0.1',
  repPort: 60051,
  pullHost: '127.0.0.1',
  pullPort: 60052,
  broadcastTopics: [
    'events.saved'
  ]
};

exports['reports/server'] = {
  reports: {
    '1': require('../backend/modules/reports/report1'),
    '2': require('../backend/modules/reports/report2'),
    '3': require('../backend/modules/reports/report3'),
    '4': require('../backend/modules/reports/report4'),
    '5': require('../backend/modules/reports/report5'),
    '6': require('../backend/modules/reports/report6'),
    '7': require('../backend/modules/reports/report7'),
    '8': require('../backend/modules/reports/report8'),
    '9': require('../backend/modules/reports/report9'),
    'qi/okRatio': require('../backend/modules/qi/okRatioReport')
  }
};
