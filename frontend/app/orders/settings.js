// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createSettings',
  './OrderSettingCollection'
], function(
  createSettings,
  OrderSettingCollection
) {
  'use strict';

  return createSettings(OrderSettingCollection);
});
