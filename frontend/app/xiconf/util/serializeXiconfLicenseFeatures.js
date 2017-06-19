// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/licenses/util/createLicenseFeaturesSerializer'
], function(
  createLicenseFeaturesSerializer
) {
  'use strict';

  return createLicenseFeaturesSerializer(['wmes', 'sol', 't24vdc', 'led', 'gprs', 'glp2', 'fl', 'ft', 'hid', 'weight']);
});
