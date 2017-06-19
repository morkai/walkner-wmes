// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createSettings',
  './ProductionSettingCollection'
], function(
  createSettings,
  ProductionSettingCollection
) {
  'use strict';

  return createSettings(ProductionSettingCollection);
});
