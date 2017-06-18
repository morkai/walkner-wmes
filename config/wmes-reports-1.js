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
    'qiResult',
    'kaizenOrder', 'kaizenSection', 'kaizenCategory',
    'suggestion',
    'behaviorObsCard',
    'minutesForSafetyCard',
    'opinionSurveyResponse'
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
    'qi/count': require('../backend/modules/qi/countReport'),
    'qi/okRatio': require('../backend/modules/qi/okRatioReport'),
    'qi/nokRatio': require('../backend/modules/qi/nokRatioReport'),
    'kaizen/count': require('../backend/modules/kaizen/countReport'),
    'kaizen/summary': require('../backend/modules/kaizen/summaryReport'),
    'suggestions/count': require('../backend/modules/suggestions/countReport'),
    'suggestions/summary': require('../backend/modules/suggestions/summaryReport'),
    'suggestions/engagement': require('../backend/modules/suggestions/engagementReport'),
    'opinionSurvey': require('../backend/modules/opinionSurveys/report')
  }
};
