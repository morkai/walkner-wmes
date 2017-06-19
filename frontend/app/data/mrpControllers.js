// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/mrpControllers/MrpControllerCollection',
  './createStorage'
], function(
  MrpControllerCollection,
  createStorage
) {
  'use strict';

  return createStorage('MRP_CONTROLLERS', 'mrpControllers', MrpControllerCollection);
});
