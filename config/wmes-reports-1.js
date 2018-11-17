'use strict';

const ports = require('./wmes-ports');
const mongodb = require('./wmes-mongodb');

exports.id = 'wmes-reports-1';

exports.modules = [
  {id: 'h5-mongoose', name: 'mongoose'},
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
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 8,
    readPreference: 'secondaryPreferred'
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'event', 'user', 'setting',
    'company', 'delayReason',
    'order', 'orderEto',
    'prodShift', 'prodShiftOrder', 'prodDowntime',
    'fteMasterEntry', 'fteLeaderEntry', 'hourlyPlan',
    'clipOrderCache', 'clipOrderCount', 'dailyMrpCount',
    'whShiftMetrics',
    'cag', 'cagGroup', 'cagPlan',
    'qiResult',
    'kaizenOrder', 'kaizenSection', 'kaizenCategory',
    'suggestion',
    'behaviorObsCard',
    'minutesForSafetyCard',
    'opinionSurveyResponse',
    'paintShopLoad'
  ]
};

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 1337,
  versionsKey: 'wmes',
  backendVersionKey: 'reports',
  frontendVersionKey: null
};

exports['messenger/server'] = Object.assign({}, ports[exports.id].server, {
  broadcastTopics: [
    'events.saved'
  ]
});

exports['reports/server'] = {
  reports: {
    'fte': require('../backend/node_modules/reports/calcFte'),
    '1': require('../backend/node_modules/reports/report1'),
    '2': require('../backend/node_modules/reports/report2'),
    'clip': require('../backend/node_modules/reports/clip'),
    '3': require('../backend/node_modules/reports/report3'),
    '4': require('../backend/node_modules/reports/report4'),
    '5': require('../backend/node_modules/reports/report5'),
    '6': require('../backend/node_modules/reports/report6'),
    '7': require('../backend/node_modules/reports/report7'),
    '8': require('../backend/node_modules/reports/report8'),
    '9': require('../backend/node_modules/reports/report9'),
    'qi/count': require('../backend/node_modules/qi/countReport'),
    'qi/okRatio': require('../backend/node_modules/qi/okRatioReport'),
    'qi/nokRatio': require('../backend/node_modules/qi/nokRatioReport'),
    'kaizen/count': require('../backend/node_modules/kaizen/countReport'),
    'kaizen/summary': require('../backend/node_modules/kaizen/summaryReport'),
    'kaizen/metrics': require('../backend/node_modules/kaizen/metricsReport'),
    'suggestions/count': require('../backend/node_modules/suggestions/countReport'),
    'suggestions/summary': require('../backend/node_modules/suggestions/summaryReport'),
    'suggestions/engagement': require('../backend/node_modules/suggestions/engagementReport'),
    'opinionSurvey': require('../backend/node_modules/opinionSurveys/report'),
    'behaviorObsCards/count': require('../backend/node_modules/behaviorObsCards/countReport'),
    'minutesForSafetyCards/count': require('../backend/node_modules/minutesForSafetyCards/countReport'),
    'paintShop/load': require('../backend/node_modules/paintShop/loadReport')
  }
};
