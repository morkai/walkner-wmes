// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createSettings',
  './ProdDowntimeSettingCollection'
], function(
  createSettings,
  ProdDowntimeSettingCollection
) {
  'use strict';

  return createSettings(ProdDowntimeSettingCollection);
});
