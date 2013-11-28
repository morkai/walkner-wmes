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
