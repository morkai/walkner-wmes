'use strict';

const MODULES = '../backend/node_modules';

module.exports = {
  'fte': require(`${MODULES}/reports/calcFte`),
  '1': require(`${MODULES}/reports/report1`),
  '2': require(`${MODULES}/reports/report2`),
  'clip': require(`${MODULES}/reports/clip`),
  '3': require(`${MODULES}/reports/report3`),
  '4': require(`${MODULES}/reports/report4`),
  '5': require(`${MODULES}/reports/report5`),
  '6': require(`${MODULES}/reports/report6`),
  '7': require(`${MODULES}/reports/report7`),
  '8': require(`${MODULES}/reports/report8`),
  '9': require(`${MODULES}/reports/report9`),
  'qi/count': require(`${MODULES}/qi/countReport`),
  'qi/okRatio': require(`${MODULES}/qi/okRatioReport`),
  'qi/nokRatio': require(`${MODULES}/qi/nokRatioReport`),
  'qi/outgoingQuality': require(`${MODULES}/qi/outgoingQualityReport`),
  'kaizen/count': require(`${MODULES}/kaizen/countReport`),
  'kaizen/summary': require(`${MODULES}/kaizen/summaryReport`),
  'kaizen/metrics': require(`${MODULES}/kaizen/metricsReport`),
  'suggestions/count': require(`${MODULES}/suggestions/countReport`),
  'suggestions/summary': require(`${MODULES}/suggestions/summaryReport`),
  'suggestions/engagement': require(`${MODULES}/suggestions/engagementReport`),
  'opinionSurvey': require(`${MODULES}/opinionSurveys/report`),
  'behaviorObsCards/count': require(`${MODULES}/behaviorObsCards/countReport`),
  'minutesForSafetyCards/count': require(`${MODULES}/minutesForSafetyCards/countReport`),
  'paintShop/load': require(`${MODULES}/paintShop/loadReport`),
  'wmes-fap/count': require(`${MODULES}/wmes-fap/reports/count`),
  'planning/execution': require(`${MODULES}/planning/reports/execution`),
  'planning/transport': require(`${MODULES}/planning/reports/transport`),
  'wmes-ct/pce': require(`${MODULES}/wmes-ct-frontend/reports/pce`)
};
