// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
