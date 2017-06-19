// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
