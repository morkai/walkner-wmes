define([
  'app/workCenters/WorkCenterCollection',
  './createStorage'
], function(
  WorkCenterCollection,
  createStorage
) {
  'use strict';

  return createStorage('WORK_CENTERS', 'workCenters', WorkCenterCollection);
});
