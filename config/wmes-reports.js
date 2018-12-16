'use strict';

module.exports = {
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
};
