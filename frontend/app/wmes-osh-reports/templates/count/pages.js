// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-reports/templates/count/nearMissPage',
  'app/wmes-osh-reports/templates/count/kaizenPage',
  'app/wmes-osh-reports/templates/count/actionPage',
  'app/wmes-osh-reports/templates/count/observationPage',
  'app/wmes-osh-reports/templates/count/accidentPage'
], function(
  nearMissPageTemplate,
  kaizenPageTemplate,
  actionPageTemplate,
  observationPageTemplate,
  accidentPageTemplate
) {
  'use strict';

  return {
    nearMiss: nearMissPageTemplate,
    kaizen: kaizenPageTemplate,
    action: actionPageTemplate,
    observation: observationPageTemplate,
    accident: accidentPageTemplate
  };
});
